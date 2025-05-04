// Lưu token và thông tin người dùng vào localStorage
function saveAuthData(token, fullName) {
    localStorage.setItem("token", token);
    localStorage.setItem("fullName", fullName);
}

// Xử lý form tính BMI
document.getElementById("bmi-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Ngăn trang reload

    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);

    const errorMessage = document.getElementById("error-message");
    const resultBox = document.getElementById("result");

    errorMessage.classList.add("d-none");
    resultBox.classList.add("d-none");

    try {
        const response = await fetch("http://localhost:3000/api/v1/bmi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weight, height })
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

// Xử lý form đăng nhập
document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Reset các lỗi cũ trước khi hiển thị lỗi mới
    document.querySelectorAll('.error-message').forEach(el => el.textContent = "");

    try {
        const response = await fetch("http://localhost:3000/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Lưu token và username vào localStorage
            saveAuthData(data.token, data.fullName);
            // Đóng modal sau khi đăng nhập thành công
            const authModal = bootstrap.Modal.getInstance(document.getElementById("authModal"));
            authModal.hide();
            // Chuyển hướng người dùng dựa trên redirect
            window.location.href = data.redirect;
        } else {
            if (data.message === "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 5 phút!") {
                alert(data.message);
                return;
            }
            // Xử lý lỗi từng mục, chỉ giữ lỗi đầu tiên cho mỗi trường
            if (data.errors && data.errors.length > 0) {
                // Lưu lỗi đầu tiên cho mỗi trường (fullName, email, ...)
                const uniqueErrors = {};
                data.errors.forEach((err) => {
                    if (!uniqueErrors[err.path]) {
                        uniqueErrors[err.path] = err.msg;
                    }
                });
                // Hiển thị lỗi đã lọc
                for (const field in uniqueErrors) {
                    const errorElement = document.getElementById(`login${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
                    if (errorElement) {
                        errorElement.textContent = uniqueErrors[field];
                    }
                }
            }
        }
    } catch (error) {
        alert("Lỗi kết nối đến server!");
    }
});

// Xử lý form đăng ký
document.getElementById("register-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = document.getElementById("registerFullName").value;
    const email = document.getElementById("registerEmail").value;
    const phone = document.getElementById("registerPhone").value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;

    // Reset các lỗi cũ trước khi hiển thị lỗi mới
    document.querySelectorAll('.error-message').forEach(el => el.textContent = "");

    try {
        const response = await fetch("http://localhost:3000/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, phone, gender, password, confirmPassword })
        });

        const data = await response.json();
        if (response.ok) {
            // Chuyển tab sang đăng nhập
            document.getElementById("login-tab").click();
        } else {
            // Xử lý lỗi từng mục, chỉ giữ lỗi đầu tiên cho mỗi trường
            if (data.errors && data.errors.length > 0) {
                // Lưu lỗi đầu tiên cho mỗi trường (fullName, email, ...)
                const uniqueErrors = {};
                data.errors.forEach((err) => {
                    if (!uniqueErrors[err.path]) {
                        uniqueErrors[err.path] = err.msg;
                    }
                });

                // Hiển thị lỗi đã lọc
                for (const field in uniqueErrors) {
                    const errorElement = document.getElementById(`register${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
                    if (errorElement) {
                        errorElement.textContent = uniqueErrors[field];
                    }
                }
            }
        }
    } catch (error) {
        alert("Lỗi kết nối đến server!");
    }
});


// Hiển thị tab đăng ký/đăng nhập
document.addEventListener("DOMContentLoaded", function () {
    const registerBtn = document.querySelector(".btn-outline-light"); // Nút Đăng ký
    const loginBtn = document.querySelector(".btn-light"); // Nút Đăng nhập

    registerBtn.addEventListener("click", function () {
        document.getElementById("register-tab").click(); // Kích hoạt tab Đăng ký
    });

    loginBtn.addEventListener("click", function () {
        document.getElementById("login-tab").click(); // Kích hoạt tab Đăng nhập
    });
});