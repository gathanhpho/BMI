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

    if (!token || !fullName) {
        alert("Vui lòng đăng nhập để truy cập trang này!");
        window.location.href = "/src/views/index.html";
        return;
    }

    document.getElementById("logout-btn").addEventListener("click", logout);

    let bmiData;
    fetchBMI();

    document.getElementById("search-btn").addEventListener("click", function () {
        const keyword = document.getElementById("search-input").value.trim();
        const fromDate = document.getElementById("from-date").value;
        const toDate = document.getElementById("to-date").value;
        const status = document.getElementById("status-select").value;

        fetchBMI(keyword, fromDate, toDate, status);
    });

    async function fetchBMI(keyword = "", fromDate = "", toDate = "", status = "", page = 1, itemsPerPage = 10) {
        const url = keyword || fromDate || toDate || status
            ? new URL("http://localhost:3000/api/v1/admin/searchBMI")
            : new URL("http://localhost:3000/api/v1/admin/getAllBMI");

        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (status) params.append("status", status);

        params.append("page", page);
        params.append("limit", itemsPerPage);
        url.search = params.toString();

        try {
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error("Lỗi lấy danh sách BMI");
            bmiData = await res.json();

            renderTable();
            renderPagination(bmiData.totalBMI, bmiData.itemsPerPage, bmiData.currentPage, (newPage) => {
                fetchBMI(keyword, fromDate, toDate, status, newPage); // Gọi lại chính xác với trang mới
                renderTable();
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách BMI:", error);
        }
    }

    function renderTable() {
        const tableBody = document.getElementById("bmi-table-body");
        tableBody.innerHTML = "";

        if (!bmiData.bmi || bmiData.bmi.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không tìm thấy dữ liệu BMI</td></tr>`;
            return;
        }

        tableBody.innerHTML = bmiData.bmi.map((bmi, index) => `
            <tr>
                <td>${(bmiData.currentPage - 1) * bmiData.itemsPerPage + index + 1}</td>
                <td>${bmi.full_name}</td>
                <td>${bmi.email}</td>
                <td>${bmi.height} cm</td>
                <td>${bmi.weight} kg</td>
                <td>${Number(bmi.bmi_index.toFixed(1))}</td>
                <td>${bmi.status}</td>
                <td>${new Date(bmi.created_at).toLocaleDateString()}</td>
                <td><button class="btn btn-danger btn-sm delete-btn" data-id="${bmi.id_bmi}">Xóa</button></td>
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
                const response = await fetch(`http://localhost:3000/api/v1/admin/softDeleteByIdBMI/${idBMI}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Không thể xóa dữ liệu');
                }
                // Hiển thị thông báo thành công
                const successMessage = document.getElementById("success-message");
                successMessage.textContent = data.message;
                successMessage.classList.remove("d-none");

                // Ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    successMessage.classList.add("d-none");
                }, 3000);

                fetchBMI(); // Cập nhật lại bảng người dùng
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu", error);
            }
        }
    }
});


