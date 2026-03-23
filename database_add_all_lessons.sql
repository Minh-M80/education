USE education;

-- Bo sung du lieu de tat ca lesson l1-l9 deu co bai tap online va nop bai.
-- An toan khi chay lai nhieu lan vi su dung INSERT IGNORE.

INSERT IGNORE INTO assignments (id, lesson_id, title, description, due_date, max_file_size_mb, allowed_formats, max_score) VALUES
('a10', 'l1', 'Bao cao tong quan ve Web', 'Tom tat vai tro cua frontend, backend va co so du lieu trong mot he thong web.', '2026-12-31 23:59:59', 10, 'pdf,docx,pptx', 100),
('a11', 'l2', 'Thuc hanh tao trang HTML ca nhan', 'Tao mot trang gioi thieu ban than bang HTML gom tieu de, doan van, danh sach ky nang va lien ket.', '2026-12-31 23:59:59', 10, 'html,zip', 100),
('a12', 'l4', 'Bai tap JavaScript DOM', 'Xay dung trang web nho su dung JavaScript de xu ly su kien, thao tac DOM va kiem tra du lieu nhap vao.', '2026-12-31 23:59:59', 15, 'html,js,zip', 100),
('a13', 'l6', 'Bao cao nhap mon Data Science', 'Trinh bay quy trinh Data Science va mot vi du ung dung thuc te.', '2026-12-31 23:59:59', 10, 'pdf,docx', 100),
('a14', 'l7', 'Phan tich du lieu voi Python', 'Xu ly mot bo du lieu nho bang Python va trinh bay ket qua phan tich.', '2026-12-31 23:59:59', 15, 'ipynb,py,zip', 100),
('a15', 'l8', 'Lam sach du lieu voi Pandas', 'Doc file CSV, xu ly gia tri thieu va xuat bao cao tong hop ket qua xu ly.', '2026-12-31 23:59:59', 15, 'ipynb,py,zip', 100),
('a16', 'l9', 'Mini report ve Machine Learning', 'Mo ta mot bai toan supervised learning va cach danh gia mo hinh bang vi du cu the.', '2026-12-31 23:59:59', 10, 'pdf,docx,pptx', 100);

INSERT IGNORE INTO exercises (id, lesson_id, title, description, type, time_limit_minutes) VALUES
('e10', 'l1', 'Cau hoi tong quan cong nghe web', 'Tra loi cac cau hoi co ban ve frontend, backend va cach trinh duyet tai trang web.', 'short-answer', 15),
('e11', 'l3', 'Bai tap CSS co ban', 'On tap selector, color va flexbox.', 'fill-blank', 20),
('e12', 'l5', 'Bai tap React can ban', 'Kiem tra kien thuc ve component, props va state.', 'short-answer', 20),
('e13', 'l6', 'Cau hoi nhap mon Data Science', 'On tap cac khai niem nhap mon ve quy trinh xu ly du lieu.', 'short-answer', 15),
('e14', 'l7', 'Bai tap Python cho Data Analysis', 'Luyen tap syntax Python co ban phuc vu phan tich du lieu.', 'coding', 25),
('e15', 'l8', 'Bai tap Pandas co ban', 'Tra loi cau hoi ve doc file va xem du lieu trong Pandas.', 'short-answer', 20),
('e16', 'l9', 'Bai tap nhap mon Machine Learning', 'On tap cac khai niem regression, classification va tap du lieu.', 'short-answer', 20);

INSERT IGNORE INTO exercise_questions (id, exercise_id, question, type, placeholder, expected_answer, hints, points) VALUES
('eq10', 'e10', 'Frontend la phan nao cua ung dung web ma nguoi dung truc tiep tuong tac?', 'short-answer', 'Nhap cau tra loi ngan...', 'giao dien', '["Lien quan den UI nguoi dung nhin thay"]', 10),
('eq11', 'e10', 'Backend thuong dam nhiem xu ly logic va ... du lieu?', 'fill-blank', 'Nhap tu con thieu...', 'luu tru', '["Dong nghia voi storage"]', 10),
('eq12', 'e11', 'Thuoc tinh CSS nao dung de doi mau chu?', 'fill-blank', 'Nhap ten thuoc tinh...', 'color', '["Thuoc tinh doi mau text"]', 10),
('eq13', 'e11', 'Gia tri nao cua display dung cho Flexbox?', 'fill-blank', 'Nhap gia tri...', 'flex', '["Lien quan bo cuc mot chieu"]', 10),
('eq14', 'e12', 'Hook nao duoc dung de quan ly state trong function component?', 'fill-blank', 'Nhap ten hook...', 'useState', '["Bat dau bang use"]', 15),
('eq15', 'e12', 'Props trong React dung de lam gi?', 'short-answer', 'Nhap cau tra loi...', 'truyen du lieu', '["Du lieu di tu component cha xuong con"]', 15),
('eq16', 'e13', 'Data Science ket hop lap trinh, thong ke va ...?', 'fill-blank', 'Nhap tu con thieu...', 'nghiep vu', '["Hieu biet domain"]', 10),
('eq17', 'e13', 'Buoc nao thuong duoc dung de tim hieu du lieu truoc khi mo hinh hoa?', 'short-answer', 'Nhap ten buoc...', 'phan tich', '["Thuong goi la exploratory data analysis"]', 10),
('eq18', 'e14', 'Viet ham tinh trung binh cong cua danh sach so.', 'coding', 'def average(numbers):\n    # your code', 'sum,len,return', '["Tong chia cho so luong phan tu"]', 20),
('eq19', 'e14', 'Viet ham dem so lan xuat hien cua mot ky tu trong chuoi.', 'coding', 'def count_char(text, ch):\n    # your code', 'for,if,return', '["Duyet qua tung ky tu"]', 20),
('eq20', 'e15', 'Ham nao trong Pandas dung de doc file CSV?', 'short-answer', 'Nhap ten ham...', 'read_csv', '["Bat dau bang read_"]', 15),
('eq21', 'e15', 'Phuong thuc nao dung de xem 5 dong dau tien cua DataFrame?', 'short-answer', 'Nhap ten phuong thuc...', 'head', '["Ten tieng Anh cua dau"]', 15),
('eq22', 'e16', 'Du doan gia nha thuong thuoc regression hay classification?', 'short-answer', 'Nhap cau tra loi...', 'regression', '["Ket qua la gia tri so"]', 15),
('eq23', 'e16', 'Tap du lieu dung de kiem tra mo hinh sau khi huan luyen goi la gi?', 'short-answer', 'Nhap ten tap du lieu...', 'test', '["Thuong ghep voi tu set"]', 15);
