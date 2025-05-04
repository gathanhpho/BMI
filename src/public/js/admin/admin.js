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

    // Lấy dữ liệu thống kê tổng số user
    try {
        const response = await fetch("http://localhost:3000/api/v1/admin/total-users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const totalUsers = await response.json();
        document.getElementById("total-users").textContent = totalUsers.toLocaleString();
    } catch (error) {
        console.error("Lỗi lấy tổng số tài khoản", error);
    }

    // Lấy dữ liệu thống kê tổng số BMI
    try {
        const bmiRes = await fetch("http://localhost:3000/api/v1/admin/total-bmi-history", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const totalBMIHistory = await bmiRes.json();
        console.log(totalBMIHistory);
        document.getElementById("total-bmi-history").textContent = totalBMIHistory.toLocaleString();
    } catch (error) {
        console.error("Lỗi lấy tổng số lịch sử BMI:", error);
    }

    // 🟢 Biểu đồ tròn - Phân loại BMI
    try {
        const response = await fetch("http://localhost:3000/api/v1/admin/status-by-status", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        // console.log(data);
        if (!data) throw new Error("Không có dữ liệu!");

        const ctxPie = document.getElementById("bmiPieChart").getContext("2d");
        new Chart(ctxPie, {
            type: "pie",
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"]
                }]
            },
            options: { responsive: true }
        });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu BMI:", error);
    };


    // Biểu đồ đường - Xu hướng BMI theo tháng
    try {
        const response = await fetch("http://localhost:3000/api/v1/admin/status-by-month", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const { labels, underweight, normal, overweight, obese } = await response.json();
        if (!labels || labels.length === 0) throw new Error("Không có dữ liệu!");

        // console.log("✅ Dữ liệu BMI theo tháng:", labels, underweight, normal, overweight, obese);

        // 🔵 Vẽ biểu đồ đường
        const ctxLine = document.getElementById("bmiLineChart").getContext("2d");
        new Chart(ctxLine, {
            type: "line",
            data: {
                labels,
                datasets: [
                    { label: "Thiếu cân", data: underweight, borderColor: "#007bff", fill: false },
                    { label: "Bình thường", data: normal, borderColor: "#28a745", fill: false },
                    { label: "Thừa cân", data: overweight, borderColor: "#ffc107", fill: false },
                    { label: "Béo phì", data: obese, borderColor: "#dc3545", fill: false }
                ]
            },
            options: { responsive: true }
        });

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu BMI theo tháng:", error);
    }
});