const baseURL = "http://localhost:5000/api/auth";

async function testLogin() {
    try {
        console.log("Attempting login with admin123@gmail.com / admin123");

        const response = await fetch(`${baseURL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin123@gmail.com",
                password: "admin123"
            })
        });

        const data = await response.json();

        console.log("Response Status:", response.status);
        console.log("Response Data:", data);

        if (response.ok) {
            if (data.role === "admin") {
                console.log("SUCCESS: User is authenticated and identified as ADMIN.");
            } else {
                console.log(`FAILURE: User authenticated but role is '${data.role}', expected 'admin'.`);
            }
        } else {
            console.log("Login Failed:", data.message);
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testLogin();
