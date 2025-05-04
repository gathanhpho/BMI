import { paginate, renderPagination } from "../../../utils/page.js";

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

    let data;

    fetchHistory(); // Gọi hàm fetchHistory khi trang được tải

    // Lắng nghe sự kiện nhấn nút "Lọc"
    document.getElementById("filterBtn").addEventListener("click", function () {
        const status = document.getElementById("statusFilter").value;
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;

        fetchHistory(status, fromDate, toDate);  // Gọi hàm fetchHistory khi nhấn nút "Lọc"
    });

    // Hiển thị lịch sử BMI khi lọc
    async function fetchHistory(status = "", fromDate = "", toDate = "", page = 1, itemsPerPage = 10) {
        const token = getToken();

        // Kiểm tra nếu có bất kỳ tham số lọc nào, dùng API lọc
        const url = status || fromDate || toDate
            ? new URL("http://localhost:3000/api/v1/user/filter")  // Đường dẫn API lọc
            : new URL("http://localhost:3000/api/v1/user/history"); // Đường dẫn API lấy tất cả dữ liệu

        const params = new URLSearchParams();

        // Thêm các tham số lọc vào URL nếu có
        if (status) params.append('status', status);
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        params.append("page", page);
        params.append("limit", itemsPerPage);
        url.search = params.toString();  // Xây dựng query string từ các tham số

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) throw new Error("Lỗi lấy danh sách người dùng");
            data = await response.json();

            renderTable(); // Gọi hàm renderTable để hiển thị dữ liệu
            // Sau khi render bảng:
            renderPagination(data.totalBMI, data.itemsPerPage, data.currentPage, (newPage) => {
                fetchHistory(status, fromDate, toDate, newPage);
                renderTable();
            });
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu", error);
        }
    }

    // Hàm render dữ liệu vào bảng với phân trang
    function renderTable() {
        const historyTableBody = document.getElementById("history-table-body");
        historyTableBody.innerHTML = "";

        if (!data.bmi || data.bmi.length === 0) {
            historyTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không có lịch sử BMI nào</td></tr>`;
            return;
        }

        historyTableBody.innerHTML = data.bmi.map((item, index) => `
            <tr>
                <td>${(data.currentPage - 1) * data.itemsPerPage + index + 1}</td>
                <td>${item.weight}</td>
                <td>${item.height}</td>
                <td>${Number(item.bmi_index.toFixed(1))}</td>
                <td>${item.status}</td>
                <td>${new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                <td><button class="btn btn-danger btn-sm delete-btn" data-id="${item.id_bmi}">Xóa</button></td>
            </tr>
        `).join('');

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const idBMI = button.getAttribute('data-id');
                softDeleteBMI(idBMI);
            });
        });
    }

    // Xoá dữ liệu BMI
    async function softDeleteBMI(idBMI) {
        const token = getToken();
        if (confirm('Bạn có chắc chắn muốn xóa dữ liệu này?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/user/softDelete/${idBMI}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                data = await response.json();

                if (!response.ok) {
                    throw new Error('Không thể xóa dữ liệu');
                }
                // Hiển thị thông báo thành công
                const successMessage = document.getElementById("success-message");
                successMessage.textContent = data.message;
                successMessage.classList.remove("d-none");  // Hiển thị thông báo thành công

                // Ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    successMessage.classList.add("d-none");
                }, 3000);

                fetchHistory(); 
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu", error);
            }
        }
    }
});