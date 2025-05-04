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

    let userData;
    fetchUsers();

    document.getElementById("search-btn").addEventListener("click", function () {
        const keyword = document.getElementById("search-input").value.trim();
        const fromDate = document.getElementById("from-date").value;
        const toDate = document.getElementById("to-date").value;

        // Gọi lại fetchUsers với các tham số lọc
        fetchUsers(keyword, fromDate, toDate);
    });

    async function fetchUsers(keyword = "", fromDate = "", toDate = "", page = 1, itemsPerPage = 10) {
        const url = keyword || fromDate || toDate
            ? new URL("http://localhost:3000/api/v1/admin/searchUser")
            : new URL("http://localhost:3000/api/v1/admin/getAllUser");

        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

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

            if (!res.ok) throw new Error("Lỗi lấy danh sách người dùng");
            userData = await res.json();

            renderTable();
            renderPagination(userData.totalUsers, userData.itemsPerPage, userData.currentPage, (newPage) => {
                fetchUsers(keyword, fromDate, toDate, newPage); // Gọi lại chính xác với trang mới
                renderTable();
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
        }
    }

    function renderTable() {
        const tableBody = document.getElementById("user-table-body");
        tableBody.innerHTML = "";

        if (userData.users.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center">Không tìm thấy người dùng nào</td></tr>`;
            return;
        }

        tableBody.innerHTML = userData.users.map((user, index) => `
            <tr>    
                <td>${(userData.currentPage - 1) * userData.itemsPerPage + index + 1}</td>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.gender}</td>
                <td>${user.role}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td><button class="btn btn-danger btn-sm delete-btn" data-id="${user.id_user}">Xóa</button></td>
            </tr>
        `).join('');

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const idUser = button.getAttribute('data-id');
                softDeleteUser(idUser);
            });
        });
    }

    // Xoá mềm người dùng
    async function softDeleteUser(idUser) {
        const token = getToken();
        if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/admin/softDeleteUserByAdmin/${idUser}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Không thể xóa người dùng');
                }

                // Hiển thị thông báo thành công
                const successMessage = document.getElementById("success-message");
                successMessage.textContent = data.message;
                successMessage.classList.remove("d-none");

                // Ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    successMessage.classList.add("d-none");
                }, 3000);

                fetchUsers(); // Cập nhật lại bảng người dùng
            } catch (error) {
                console.error("Lỗi khi xóa người dùng:", error);
            }
        }
    }
});
