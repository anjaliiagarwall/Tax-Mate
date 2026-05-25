import streamlit as st
import json
import pandas as pd
import matplotlib.pyplot as plt
import os
from openai import OpenAI

# ----------------------------------
# OpenRouter Client (CORRECT SETUP)
# ----------------------------------
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY", ""),
    default_headers={
        "HTTP-Referer": "http://localhost:8501",
        "X-Title": "Tax Chart Bot"
    }
)

# ----------------------------------
# Streamlit UI
# ----------------------------------
st.set_page_config(page_title="Tax Chart Bot", layout="centered")
st.title("📊 Tax Query Chart Bot")

st.caption("""
Ask things like:
• Show income tax slabs  
• Compare old vs new tax regime  
• GST revenue distribution  
""")

query = st.text_input("Enter your tax query")

# ----------------------------------
# Button Logic
# ----------------------------------
if st.button("Generate"):
    if not query.strip():
        st.warning("Please enter a query")
    else:
        with st.spinner("Thinking..."):
            try:
                response = client.chat.completions.create(
                    model="openai/gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a tax assistant. "
                                "If the user asks for a chart, respond ONLY in JSON with keys: "
                                "title, chart_type (bar/pie/line), labels, values. "
                                "Otherwise respond normally."
                            )
                        },
                        {"role": "user", "content": query}
                    ],
                    timeout=30
                )

                reply = response.choices[0].message.content

                # Try JSON chart
                try:
                    data = json.loads(reply)

                    df = pd.DataFrame({
                        "Label": data["labels"],
                        "Value": data["values"]
                    })

                    st.subheader(data["title"])
                    plt.figure()

                    if data["chart_type"] == "bar":
                        plt.bar(df["Label"], df["Value"])
                    elif data["chart_type"] == "pie":
                        plt.pie(df["Value"], labels=df["Label"], autopct="%1.1f%%")
                    elif data["chart_type"] == "line":
                        plt.plot(df["Label"], df["Value"], marker="o")

                    plt.xticks(rotation=45)
                    st.pyplot(plt)

                except json.JSONDecodeError:
                    st.write(reply)

            except Exception as e:
                st.error("Connection failed. Please check API key or network.")
                st.caption(str(e))
