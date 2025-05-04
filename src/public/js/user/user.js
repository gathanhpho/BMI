function getToken() {
    return localStorage.getItem("token");
}

function getUsername() {
    return localStorage.getItem("fullName");
}

function clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
}

function logout() {
    clearAuthData();
    window.location.href = "/src/views/index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    const token = getToken();
    const fullName = getUsername();
    const userNameSpan = document.getElementById("user-name");

    if (!token || !fullName) {
        alert("Vui lòng đăng nhập để truy cập trang này!");
        window.location.href = "/src/views/index.html";
        return;
    }
    console.log(fullName);
    userNameSpan.textContent = `Xin chào, ${fullName}`;

    document.getElementById("logout-btn").addEventListener("click", logout);

    document.getElementById("bmi-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const weight = parseFloat(document.getElementById("weight").value);
        const height = parseFloat(document.getElementById("height").value);
        const errorMessage = document.getElementById("error-message");
        const resultBox = document.getElementById("result");

        errorMessage.classList.add("d-none");
        resultBox.classList.add("d-none");

        try {
            const response = await fetch(`http://localhost:3000/api/v1/user/BMI`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getToken()}`, // Định dạng token chuẩn
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ height, weight })
            });

            const data = await response.json();
            if (response.ok) {
                document.getElementById("bmi-value").textContent = data.bmiIndex;
                document.getElementById("advice").textContent = data.advice;
                resultBox.classList.remove("d-none");
            } else {
                errorMessage.classList.remove("d-none");
                if (data.errors && data.errors.length > 0) {
                    // Lưu lỗi đầu tiên cho mỗi trường (height, weight, ...)
                    const uniqueErrors = {};
                    data.errors.forEach((err) => {
                        if (!uniqueErrors[err.path]) {
                            uniqueErrors[err.path] = err.msg;
                        }
                    });

                    // Gộp các lỗi lại thành chuỗi
                    errorMessage.textContent = Object.values(uniqueErrors).join(', ');
                }
            }
        } catch (error) {
            errorMessage.classList.remove("d-none");
            errorMessage.textContent = "Lỗi kết nối đến server!";
        }
    });
})