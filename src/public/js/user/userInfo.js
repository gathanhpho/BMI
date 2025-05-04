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

document.addEventListener("DOMContentLoaded", async function () {
    const token = getToken();
    const fullName = getUsername();
    const userNameSpan = document.getElementById("user-name");

    if (!token || !fullName) {
        alert("Vui lòng đăng nhập để truy cập trang này!");
        window.location.href = "/src/views/index.html";
        return;
    }

    userNameSpan.textContent = `Xin chào, ${fullName}`;

    document.getElementById("logout-btn").addEventListener("click", logout);

    try {
        const response = await fetch("http://localhost:3000/api/v1/user/userInfo", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Lỗi khi lấy thông tin người dùng");

        const user = await response.json();

        document.getElementById("full_name").value = user.full_name;
        document.getElementById("email").value = user.email;
        document.getElementById("gender").value = user.gender;
        document.getElementById("phone").value = user.phone;
        document.getElementById("created_at").value = new Date(user.created_at).toLocaleString("vi-VN");

    } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
    }
    document.getElementById("edit-btn").addEventListener("click", function () {
        // Bỏ disabled các trường thông tin
        document.getElementById("full_name").removeAttribute("disabled");
        document.getElementById("email").removeAttribute("disabled");
        document.getElementById("phone").removeAttribute("disabled");
        document.getElementById("gender").classList.add("d-none"); // Ẩn input text giới tính

        // Hiển thị radio buttons giới tính
        document.getElementById("gender-radio-group").classList.remove("d-none");

        // Ẩn nút Chỉnh sửa và hiển thị nút Lưu
        document.getElementById("edit-btn").classList.add("d-none");
        document.getElementById("save-btn").classList.remove("d-none");
    });

    document.getElementById("profile-form").addEventListener("submit", async function (event) {
        event.preventDefault();  // Ngừng hành động mặc định (submit form)

        // Trước khi gửi dữ liệu, xóa thông báo lỗi nếu có
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach((errorElement) => {
            errorElement.textContent = '';  // Xóa nội dung lỗi
        });

        // Lấy giá trị của các trường
        const fullName = document.getElementById("full_name").value.trim();  // Lấy giá trị của full name và loại bỏ khoảng trắng thừa
        const email = document.getElementById("email").value.trim();  // Lấy giá trị của email
        const genderInput = document.querySelector('input[name="gender"]:checked');
        const gender = genderInput ? genderInput.value : "";  // Nếu không có gì được chọn, gán giá trị mặc định là ""
        const phone = document.getElementById("phone").value.trim();  // Lấy giá trị của phone và loại bỏ khoảng trắng thừa

        try {
            const response = await fetch(`http://localhost:3000/api/v1/user/updateInfo`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,  // Dùng token xác thực
                    "Content-Type": "application/json"   // Định dạng dữ liệu là JSON
                },
                body: JSON.stringify({ fullName, email, gender, phone }) // Gửi dữ liệu vào body request
            });

            const data = await response.json();  // Lấy dữ liệu phản hồi từ server

            if (response.ok) {
                // Hiển thị thông báo thành công
                const successMessage = document.getElementById("success-message");
                successMessage.textContent = data.message;
                successMessage.classList.remove("d-none");  // Hiển thị thông báo thành công

                // Ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    successMessage.classList.add("d-none");
                }, 3000);

                // Ẩn nút Lưu và hiển thị nút Chỉnh sửa
                document.getElementById("edit-btn").classList.remove("d-none");
                document.getElementById("save-btn").classList.add("d-none");

                // Bật lại disabled cho các trường thông tin sau khi lưu
                document.getElementById("full_name").setAttribute("disabled", true);
                document.getElementById("email").setAttribute("disabled", true);
                document.getElementById("phone").setAttribute("disabled", true);
                document.getElementById("gender-radio-group").classList.add("d-none"); // Ẩn nhóm radio buttons giới tính

                // Hiển thị lại input text giới tính
                document.getElementById("gender").classList.remove("d-none");

            } else {
                if (data.errors && data.errors.length > 0) {
                    const uniqueErrors = {};
                    data.errors.forEach((err) => {
                        if (!uniqueErrors[err.path]) {
                            uniqueErrors[err.path] = err.msg;
                        }
                    });

                    for (const field in uniqueErrors) {
                        const errorElement = document.getElementById(`update${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
                        if (errorElement) {
                            errorElement.textContent = uniqueErrors[field];
                        }
                    }
                }
            }

            // Cập nhật lại thông tin trên trang 
            document.getElementById("full_name").value = fullName;
            document.getElementById("email").value = email;
            document.getElementById("gender").value = gender;  // Nếu bạn dùng select hoặc radio
            document.getElementById("phone").value = phone;

        } catch (error) {
            alert(error.message); // Thông báo lỗi nếu có
        }
    });

    // Xử lý hiển thị form đổi mật khẩu
    const passwordForm = document.getElementById("password-form");
    const togglePasswordFormBtn = document.getElementById("toggle-password-form-btn");
    const cancelPasswordBtn = document.getElementById("cancel-password-btn");

    togglePasswordFormBtn.addEventListener("click", function () {
        passwordForm.classList.toggle("d-none");
    });

    cancelPasswordBtn.addEventListener("click", function () {
        passwordForm.classList.add("d-none");
    });

    // Xử lý đổi mật khẩu
    document.getElementById("change-password-btn").addEventListener("click", async function () {
        // Lấy giá trị từ các trường
        const oldPassword = document.getElementById("old-password").value;
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Reset các lỗi cũ
        document.querySelectorAll('.error-message').forEach(el => el.textContent = "");

        // Kiểm tra token
        const token = localStorage.getItem("token");
        if (!token) {
            document.getElementById("oldPasswordError").textContent = "Vui lòng đăng nhập để đổi mật khẩu!";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/v1/user/changePassword", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
            });

            const data = await response.json();
            console.log("Phản hồi từ API:", data);

            if (response.ok) {
                // Hiển thị thông báo thành công
                const successMessage = document.getElementById("success-message");
                successMessage.textContent = data.message;
                successMessage.classList.remove("d-none");  // Hiển thị thông báo thành công

                // Ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    successMessage.classList.add("d-none");
                }, 3000);

                const passwordForm = document.getElementById("change-password-form");
                passwordForm.classList.add("d-none"); // Ẩn form sau khi đổi mật khẩu thành công
                oldPassword.value = "";
                newPassword.value = "";
                confirmPassword.value = "";
            } else {
                // Xử lý lỗi từ API
                if (data.errors && data.errors.length > 0) {
                    const uniqueErrors = {};
                    data.errors.forEach((err) => {
                        if (!uniqueErrors[err.path]) {
                            uniqueErrors[err.path] = err.msg;
                        }
                    });

                    // Hiển thị lỗi
                    for (const field in uniqueErrors) {
                        const errorElement = document.getElementById(`${field}Error`);
                        if (errorElement) {
                            errorElement.textContent = uniqueErrors[field];
                        }
                    }
                } else {
                    // Hiển thị lỗi chung nếu không có errors
                    document.getElementById("oldPasswordError").textContent = data.message || "Đổi mật khẩu thất bại!";
                }
            }
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            document.getElementById("oldPasswordError").textContent = "Lỗi kết nối đến server!";
        }
    });
});
