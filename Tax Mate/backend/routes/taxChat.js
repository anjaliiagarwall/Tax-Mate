const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdf = require("pdf-parse");

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure OpenAI client for OpenRouter
const OpenAI = require("openai");
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Chat Route with OpenRouter (Real-time AI)
router.post("/", async (req, res) => {
    const { message, history } = req.body;

    if (!message && (!history || history.length === 0)) {
        return res.status(400).json({ error: "Message is required" });
    }

    // Construct messages array for OpenAI API
    const apiMessages = [
        {
            role: "system",
            content: `You are TaxMate AI, a comprehensive Indian Financial & Tax Expert. 
            
            **Your Capabilities:**
            1. **Current Tax Laws (FY 2026-27):** You have specific knowledge of the Budget 2026 tax slabs (see below). Use this as the DEFAULT for current calculations.
            2. **Historical Data:** You can answer questions about ANY past financial year (e.g., FY 2024-25, 2023-24) using your general knowledge.
            3. **General Finance:** You are an expert in GST, Banking, Government Schemes (PPF, SSY, etc.), Insurance, and Investment planning.
            4. **Context Awareness:** You remember previous messages in the conversation.
            
            **Current Date context:** February 2026.

            **LATEST TAX RULES - FY 2026-27 (AY 2027-28):**
            *Use these rules when the user asks for "current" tax or "2026" tax.*
            
            **New Tax Regime (FY 2026-27):**
            - Up to ₹4,00,000: Nil
            - ₹4,00,001 to ₹8,00,000: 5%
            - ₹8,00,001 to ₹12,00,000: 10%
            - ₹12,00,001 to ₹16,00,000: 15%
            - ₹16,00,001 to ₹20,00,000: 20%
            - ₹20,00,001 to ₹24,00,000: 25%
            - Above ₹24,00,000: 30%
            - **Standard Deduction:** ₹75,000.
            - **87A Rebate:** Tax-free up to ₹12 Lakhs taxable income (approx ₹12.75L salary).

            **Instructions:**
            - If the user asks about a specific year (e.g., "What was the slab in 2024?"), ANSWER IT using your internal knowledge. Do NOT say you don't know.
            - If the user asks about "latest" or "current", use the 2026-27 data provided above.
            - Be an authoritative, helpful, and friendly financial guide.`
        }
    ];

    // Append history if valid
    if (history && Array.isArray(history)) {
        const formattedHistory = history.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text
        }));
        apiMessages.push(...formattedHistory);
    }

    if (message) {
        apiMessages.push({ role: "user", content: message });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: apiMessages,
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error("OpenRouter API Error:", error);
        res.status(500).json({
            reply: "I'm having trouble connecting to my tax database right now. Please try again later.",
            error: error.message
        });
    }
});

// PDF Upload & Extraction Route
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const extraInfo = req.body.extraInfo || "";

        const dataBuffer = req.file.buffer;
        const data = await pdf(dataBuffer);
        const text = data.text;

        const prompt = `You are a tax data extraction bot. I am providing you with the text extracted from a user's salary slip PDF, which might contain data for multiple months (up to 12 months). I am also providing some additional extra information from the user. 
        
        Your task is to analyze this data and return ONLY a valid JSON object. Do not include any markdown, triple backticks, or conversational text. Just the JSON.

        If there are multiple months of data, SUM THEM UP for the entire year and return the annualized totals. Make sure to logically consider the 'extra information' provided by the user. If the user mentions extra income or deductions, factor them into the appropriate fields.

        The JSON should strictly follow this structure:
        {
          "employer": "Name of Employer if found, otherwise Unknown",
          "name": "Employee Name if found, otherwise Unknown",
          "pan": "PAN Number if found, otherwise Unknown",
          "basic": <Total Basic Salary as a number>,
          "hra": <Total House Rent Allowance as a number>,
          "pf": <Total Provident Fund Deducted as a number>,
          "profTax": <Total Professional Tax as a number>,
          "otherAllowances": <Total Other Allowances as a number>,
          "totalEarnings": <Total Gross Earnings as a number. This should ideally be the sum of all earnings / gross salary>,
          "totalDeductions": <Total Deductions as a number>
        }

        Here is the extra information provided by the user:
        """${extraInfo}"""

        Here is the PDF text:
        """${text}"""
        `;

        try {
            const completion = await openai.chat.completions.create({
                model: "google/gemini-2.0-flash-001",
                messages: [{ role: "user", content: prompt }]
            });

            const reply = completion.choices[0].message.content.trim();
            const cleanJsonStr = reply.replace(/```json/gi, "").replace(/```/gi, "").trim();
            const extractedData = JSON.parse(cleanJsonStr);

            res.json({
                success: true,
                data: extractedData,
                message: "Successfully extracted data from Salary Slip using AI!"
            });

        } catch (aiError) {
            console.error("AI Parse Error:", aiError);
            res.status(500).json({ error: "Failed to parse salary data using AI" });
        }

    } catch (error) {
        console.error("PDF Parse Error:", error);
        res.status(500).json({ error: "Failed to process PDF" });
    }
});

module.exports = router;
