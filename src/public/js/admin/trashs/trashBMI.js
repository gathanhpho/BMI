import { paginate, renderPagination } from "../../../../utils/page.js";

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
    const itemsPerPage = 10;  // Số lượng bản ghi mỗi trang
    let currentPage = 1;      // Trang hiện tại
    // Hiển thị thùng rác
    fetchTrash(); // Gọi hàm fetchTrash khi trang được tải 

    // Hiển thị thùng rác (nếu có)
    async function fetchTrash() {
        const token = getToken();

        try {
            const response = await fetch("http://localhost:3000/api/v1/admin/getSoftDeleteBMIByAdmin", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            bmiData = await response.json();

            if (!Array.isArray(bmiData)) {
                bmiData = []; // Hoặc hiển thị thông báo lỗi phù hợp
            }

            renderTable(); // Gọi hàm renderTable để hiển thị dữ liệu
            // Sau khi render bảng:
            renderPagination(bmiData.length, itemsPerPage, currentPage, (newPage) => {
                currentPage = newPage;
                renderTable();
            });
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu", error);
        }
    }

    // Hàm render dữ liệu vào bảng với phân trang
    function renderTable() {
        const tableBody = document.getElementById("history-table-body");
        tableBody.innerHTML = "";

        if (bmiData.length === 0) {
            historyTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không có lịch sử BMI nào trong thùng rác</td></tr>`;
            return;
        }

        const paginatedData = paginate(bmiData, currentPage, itemsPerPage);

        tableBody.innerHTML = paginatedData.map((bmi, index) => `
        <tr>    
            <td>${(currentPage - 1) * itemsPerPage + index + 1}</td>
            <td>${bmi.full_name}</td>
            <td>${bmi.email}</td>
            <td>${bmi.height} cm</td>
            <td>${bmi.weight} kg</td>
            <td>${Number(bmi.bmi_index.toFixed(1))}</td>
            <td>${bmi.status}</td>
            <td>${new Date(bmi.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-success btn-sm restore-btn" data-id="${bmi.id_bmi}">Khôi phục</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${bmi.id_bmi}">Xóa vĩnh viễn</button>
            </td>
        </tr>
    `).join('');

        document.querySelectorAll('.restore-btn').forEach(button => {
            button.addEventListener('click', function () {
                const idBMI = button.getAttribute('data-id');
                restoreBMI(idBMI);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const idBMI = button.getAttribute('data-id');
                deleteBMI(idBMI);
            });
        });
    }

    // Khôi phục dữ liệu BMI từ thùng rác
    async function restoreBMI(idBMI) {
        const token = getToken();

        // Hỏi người dùng xác nhận trước khi khôi phục
        if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu này?')) {
            try {
                // Sử dụng API phục hồi dữ liệu
                const response = await fetch(`http://localhost:3000/api/v1/admin/recoverBMIByAdmin/${idBMI}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Không thể khôi phục dữ liệu');
                }

                // Hiển thị thông báo thành công
                const successMessage = document.getElementById("success-message");
                successMessage.textContent = data.message;
                successMessage.classList.remove("d-none");  // Hiển thị thông báo thành công

                // Ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    successMessage.classList.add("d-none");
                }, 3000);

                fetchTrash();  // Gọi lại hàm fetchTrash để tải lại thùng rác sau khi khôi phục
            } catch (error) {
                console.error("Lỗi khi khôi phục dữ liệu", error);
            }
        }
    }

    // User xóa vĩnh viễn bản ghi
    async function deleteBMI(idBMI) {
        const token = getToken();

        // Hỏi người dùng xác nhận trước khi khôi phục
        if (confirm('Bạn có chắc chắn muốn xóa dữ liệu này?')) {
            try {
                // Sử dụng API phục hồi dữ liệu
                const response = await fetch(`http://localhost:3000/api/v1/admin/deleteBMI/${idBMI}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Không thể xóa dữ liệu');
                }

                // Hiển thị thông báo thành công
                const successMessage = document.getElementById("success-message");
                successMessage.textContent = data.message;
                successMessage.classList.remove("d-none");  // Hiển thị thông báo thành công

                // Ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    successMessage.classList.add("d-none");
                }, 3000);

                fetchTrash();  // Gọi lại hàm fetchTrash để tải lại thùng rác sau khi khôi phục
            } catch (error) {
                console.error("Lỗi khi khôi phục dữ liệu", error);
            }
        }
    }
});   
