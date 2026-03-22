import { Course, Quiz, Assignment, Exercise } from '@/types/lms';

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, React, Node.js and more. Build real projects and become a full-stack developer.',
    instructor: 'Dr. Angela Yu',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    price: 1999000,
    duration: '52 hours',
    level: 'Beginner',
    category: 'Web Development',
    rating: 4.8,
    totalStudents: 15420,
    totalLessons: 48,
    lessons: [
      { id: 'l1', courseId: '1', title: 'Introduction to Web Development', description: 'Overview of web technologies', duration: '15 min', order: 1 },
      { id: 'l2', courseId: '1', title: 'HTML Fundamentals', description: 'Learn HTML structure and elements', duration: '45 min', order: 2 },
      { id: 'l3', courseId: '1', title: 'CSS Styling Basics', description: 'Style your web pages beautifully', duration: '50 min', order: 3 },
      { id: 'l4', courseId: '1', title: 'JavaScript Essentials', description: 'Programming fundamentals with JS', duration: '60 min', order: 4 },
      { id: 'l5', courseId: '1', title: 'React Introduction', description: 'Build modern UI with React', duration: '55 min', order: 5 },
    ]
  },
  {
    id: '2',
    title: 'Data Science & Machine Learning',
    description: 'Learn Python, Data Analysis, Machine Learning, and AI. Work with real datasets and build predictive models.',
    instructor: 'Prof. Andrew Ng',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    price: 2499000,
    duration: '68 hours',
    level: 'Intermediate',
    category: 'Data Science',
    rating: 4.9,
    totalStudents: 23150,
    totalLessons: 62,
    lessons: [
      { id: 'l6', courseId: '2', title: 'Introduction to Data Science', description: 'What is Data Science?', duration: '20 min', order: 1 },
      { id: 'l7', courseId: '2', title: 'Python for Data Analysis', description: 'Python basics for DS', duration: '50 min', order: 2 },
      { id: 'l8', courseId: '2', title: 'Pandas & NumPy', description: 'Data manipulation libraries', duration: '60 min', order: 3 },
      { id: 'l9', courseId: '2', title: 'Machine Learning Basics', description: 'Introduction to ML concepts', duration: '45 min', order: 4 },
    ]
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    description: 'Design beautiful user interfaces and create amazing user experiences. Master Figma, Adobe XD, and design principles.',
    instructor: 'Sarah Chen',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    price: 1799000,
    duration: '38 hours',
    level: 'Beginner',
    category: 'Design',
    rating: 4.7,
    totalStudents: 8920,
    totalLessons: 35,
    lessons: [
      { id: 'l10', courseId: '3', title: 'Design Fundamentals', description: 'Core design principles', duration: '30 min', order: 1 },
      { id: 'l11', courseId: '3', title: 'Color Theory', description: 'Understanding colors in design', duration: '40 min', order: 2 },
      { id: 'l12', courseId: '3', title: 'Typography Basics', description: 'Working with fonts', duration: '35 min', order: 3 },
    ]
  },
  {
    id: '4',
    title: 'Digital Marketing Complete Course',
    description: 'Master SEO, Social Media Marketing, Content Marketing, and Google Ads. Grow your business online.',
    instructor: 'Mark Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    price: 1499000,
    duration: '42 hours',
    level: 'Beginner',
    category: 'Marketing',
    rating: 4.6,
    totalStudents: 12340,
    totalLessons: 40,
    lessons: [
      { id: 'l13', courseId: '4', title: 'Digital Marketing Overview', description: 'Introduction to digital marketing', duration: '25 min', order: 1 },
      { id: 'l14', courseId: '4', title: 'SEO Fundamentals', description: 'Search engine optimization basics', duration: '55 min', order: 2 },
    ]
  },
  {
    id: '5',
    title: 'Mobile App Development with Flutter',
    description: 'Build beautiful cross-platform mobile apps for iOS and Android using Flutter and Dart.',
    instructor: 'Maximilian Schwarzmüller',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    price: 2199000,
    duration: '45 hours',
    level: 'Intermediate',
    category: 'Mobile Development',
    rating: 4.8,
    totalStudents: 9870,
    totalLessons: 52,
    lessons: [
      { id: 'l15', courseId: '5', title: 'Flutter Setup', description: 'Setting up development environment', duration: '20 min', order: 1 },
      { id: 'l16', courseId: '5', title: 'Dart Language Basics', description: 'Learn Dart programming', duration: '50 min', order: 2 },
    ]
  },
  {
    id: '6',
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services. Learn EC2, S3, Lambda, and more. Prepare for AWS certification.',
    instructor: 'Stephane Maarek',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    price: 2799000,
    duration: '55 hours',
    level: 'Advanced',
    category: 'Cloud Computing',
    rating: 4.9,
    totalStudents: 18560,
    totalLessons: 58,
    lessons: [
      { id: 'l17', courseId: '6', title: 'AWS Overview', description: 'Introduction to AWS services', duration: '30 min', order: 1 },
      { id: 'l18', courseId: '6', title: 'EC2 Deep Dive', description: 'Elastic Compute Cloud', duration: '60 min', order: 2 },
    ]
  },
  {
    id: '7',
    title: 'Lập trình Python cơ bản',
    description: 'Khóa học Python từ con số 0. Học cú pháp, cấu trúc dữ liệu, OOP và xây dựng các dự án thực tế.',
    instructor: 'Nguyễn Văn Minh',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
    price: 899000,
    duration: '28 hours',
    level: 'Beginner',
    category: 'Programming',
    rating: 4.7,
    totalStudents: 8450,
    totalLessons: 6,
    lessons: [
      { id: 'l19', courseId: '7', title: 'Giới thiệu Python', description: 'Cài đặt và làm quen với Python', duration: '25 min', order: 1 },
      { id: 'l20', courseId: '7', title: 'Biến và kiểu dữ liệu', description: 'Các kiểu dữ liệu trong Python', duration: '40 min', order: 2 },
      { id: 'l21', courseId: '7', title: 'Cấu trúc điều khiển', description: 'If-else, vòng lặp for, while', duration: '50 min', order: 3 },
      { id: 'l22', courseId: '7', title: 'Hàm và Module', description: 'Viết hàm và sử dụng module', duration: '45 min', order: 4 },
      { id: 'l23', courseId: '7', title: 'List và Dictionary', description: 'Cấu trúc dữ liệu quan trọng', duration: '55 min', order: 5 },
      { id: 'l24', courseId: '7', title: 'Lập trình hướng đối tượng', description: 'Class, Object, Inheritance', duration: '60 min', order: 6 },
    ]
  },
  {
    id: '8',
    title: 'Thiết kế đồ họa với Canva',
    description: 'Học thiết kế chuyên nghiệp với Canva. Tạo poster, banner, social media content và nhiều hơn nữa.',
    instructor: 'Trần Thị Hoa',
    thumbnail: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&q=80',
    price: 599000,
    duration: '15 hours',
    level: 'Beginner',
    category: 'Design',
    rating: 4.8,
    totalStudents: 12300,
    totalLessons: 5,
    lessons: [
      { id: 'l25', courseId: '8', title: 'Làm quen với Canva', description: 'Giao diện và công cụ cơ bản', duration: '20 min', order: 1 },
      { id: 'l26', courseId: '8', title: 'Thiết kế Poster', description: 'Tạo poster quảng cáo', duration: '35 min', order: 2 },
      { id: 'l27', courseId: '8', title: 'Banner & Thumbnail', description: 'Thiết kế cho YouTube, Facebook', duration: '40 min', order: 3 },
      { id: 'l28', courseId: '8', title: 'Social Media Content', description: 'Tạo content cho Instagram, TikTok', duration: '45 min', order: 4 },
      { id: 'l29', courseId: '8', title: 'Branding cơ bản', description: 'Xây dựng nhận diện thương hiệu', duration: '50 min', order: 5 },
    ]
  },
  {
    id: '9',
    title: 'Excel nâng cao cho dân văn phòng',
    description: 'Thành thạo Excel với các hàm nâng cao, Pivot Table, Macro và Power Query. Tăng hiệu suất công việc gấp 10 lần.',
    instructor: 'Lê Hoàng Nam',
    thumbnail: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80',
    price: 799000,
    duration: '20 hours',
    level: 'Intermediate',
    category: 'Office',
    rating: 4.6,
    totalStudents: 15600,
    totalLessons: 8,
    lessons: [
      { id: 'l30', courseId: '9', title: 'Ôn tập Excel cơ bản', description: 'Các hàm cơ bản cần biết', duration: '30 min', order: 1 },
      { id: 'l31', courseId: '9', title: 'Hàm VLOOKUP & HLOOKUP', description: 'Tra cứu dữ liệu chuyên nghiệp', duration: '45 min', order: 2 },
      { id: 'l32', courseId: '9', title: 'Hàm INDEX & MATCH', description: 'Thay thế VLOOKUP linh hoạt hơn', duration: '40 min', order: 3 },
      { id: 'l33', courseId: '9', title: 'Pivot Table', description: 'Tổng hợp và phân tích dữ liệu', duration: '50 min', order: 4 },
      { id: 'l34', courseId: '9', title: 'Pivot Chart', description: 'Biểu đồ động từ Pivot Table', duration: '35 min', order: 5 },
      { id: 'l35', courseId: '9', title: 'Conditional Formatting', description: 'Định dạng có điều kiện nâng cao', duration: '30 min', order: 6 },
      { id: 'l36', courseId: '9', title: 'Power Query', description: 'Xử lý dữ liệu tự động', duration: '55 min', order: 7 },
      { id: 'l37', courseId: '9', title: 'Macro & VBA cơ bản', description: 'Tự động hóa công việc', duration: '60 min', order: 8 },
    ]
  },
  {
    id: '10',
    title: 'Tiếng Anh giao tiếp công sở',
    description: 'Nâng cao kỹ năng tiếng Anh cho môi trường làm việc. Email, meeting, presentation và networking.',
    instructor: 'Ms. Jennifer Nguyen',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    price: 1299000,
    duration: '32 hours',
    level: 'Intermediate',
    category: 'Language',
    rating: 4.9,
    totalStudents: 9800,
    totalLessons: 7,
    lessons: [
      { id: 'l38', courseId: '10', title: 'Business Vocabulary', description: 'Từ vựng thông dụng công sở', duration: '40 min', order: 1 },
      { id: 'l39', courseId: '10', title: 'Email Writing', description: 'Viết email chuyên nghiệp', duration: '50 min', order: 2 },
      { id: 'l40', courseId: '10', title: 'Phone Calls', description: 'Giao tiếp qua điện thoại', duration: '35 min', order: 3 },
      { id: 'l41', courseId: '10', title: 'Meetings', description: 'Tham gia và điều hành cuộc họp', duration: '55 min', order: 4 },
      { id: 'l42', courseId: '10', title: 'Presentations', description: 'Thuyết trình bằng tiếng Anh', duration: '60 min', order: 5 },
      { id: 'l43', courseId: '10', title: 'Negotiations', description: 'Kỹ năng đàm phán', duration: '45 min', order: 6 },
      { id: 'l44', courseId: '10', title: 'Networking', description: 'Xây dựng mối quan hệ chuyên nghiệp', duration: '40 min', order: 7 },
    ]
  },
  {
    id: '11',
    title: 'Photoshop từ Zero đến Hero',
    description: 'Làm chủ Adobe Photoshop. Chỉnh sửa ảnh, thiết kế banner, retouch và composite ảnh chuyên nghiệp.',
    instructor: 'Phạm Quốc Đạt',
    thumbnail: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80',
    price: 1499000,
    duration: '35 hours',
    level: 'Beginner',
    category: 'Design',
    rating: 4.7,
    totalStudents: 7650,
    totalLessons: 6,
    lessons: [
      { id: 'l45', courseId: '11', title: 'Giao diện Photoshop', description: 'Làm quen với workspace', duration: '25 min', order: 1 },
      { id: 'l46', courseId: '11', title: 'Layer & Selection', description: 'Quản lý layer và vùng chọn', duration: '45 min', order: 2 },
      { id: 'l47', courseId: '11', title: 'Retouching cơ bản', description: 'Chỉnh sửa da, xóa mụn', duration: '50 min', order: 3 },
      { id: 'l48', courseId: '11', title: 'Color Correction', description: 'Chỉnh màu chuyên nghiệp', duration: '55 min', order: 4 },
      { id: 'l49', courseId: '11', title: 'Text Effects', description: 'Hiệu ứng chữ ấn tượng', duration: '40 min', order: 5 },
      { id: 'l50', courseId: '11', title: 'Photo Composite', description: 'Ghép ảnh sáng tạo', duration: '60 min', order: 6 },
    ]
  },
  {
    id: '12',
    title: 'Quản lý dự án với Agile & Scrum',
    description: 'Học phương pháp Agile và framework Scrum. Quản lý dự án hiệu quả, làm việc nhóm tốt hơn.',
    instructor: 'Vũ Đức Anh',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    price: 1099000,
    duration: '18 hours',
    level: 'Intermediate',
    category: 'Business',
    rating: 4.8,
    totalStudents: 5430,
    totalLessons: 4,
    lessons: [
      { id: 'l51', courseId: '12', title: 'Agile Mindset', description: 'Tư duy Agile là gì?', duration: '35 min', order: 1 },
      { id: 'l52', courseId: '12', title: 'Scrum Framework', description: 'Các roles, events, artifacts', duration: '50 min', order: 2 },
      { id: 'l53', courseId: '12', title: 'Sprint Planning & Review', description: 'Lập kế hoạch và đánh giá sprint', duration: '45 min', order: 3 },
      { id: 'l54', courseId: '12', title: 'Kanban & Tools', description: 'Jira, Trello và công cụ quản lý', duration: '40 min', order: 4 },
    ]
  },
  {
    id: '13',
    title: 'Git & GitHub cho Developer',
    description: 'Thành thạo version control với Git. Làm việc nhóm hiệu quả với GitHub, branching và pull request.',
    instructor: 'Hoàng Minh Tuấn',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80',
    price: 499000,
    duration: '12 hours',
    level: 'Beginner',
    category: 'Programming',
    rating: 4.9,
    totalStudents: 11200,
    totalLessons: 5,
    lessons: [
      { id: 'l55', courseId: '13', title: 'Git là gì?', description: 'Giới thiệu version control', duration: '20 min', order: 1 },
      { id: 'l56', courseId: '13', title: 'Git cơ bản', description: 'Add, commit, push, pull', duration: '40 min', order: 2 },
      { id: 'l57', courseId: '13', title: 'Branching & Merging', description: 'Làm việc với nhánh', duration: '45 min', order: 3 },
      { id: 'l58', courseId: '13', title: 'GitHub Workflow', description: 'Pull request, code review', duration: '50 min', order: 4 },
      { id: 'l59', courseId: '13', title: 'Xử lý Conflict', description: 'Giải quyết xung đột code', duration: '35 min', order: 5 },
    ]
  },
  {
    id: '14',
    title: 'SQL và Cơ sở dữ liệu',
    description: 'Học SQL từ cơ bản đến nâng cao. Thiết kế database, viết query phức tạp và tối ưu hiệu suất.',
    instructor: 'Đặng Thị Mai',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
    price: 999000,
    duration: '25 hours',
    level: 'Beginner',
    category: 'Data Science',
    rating: 4.6,
    totalStudents: 8900,
    totalLessons: 7,
    lessons: [
      { id: 'l60', courseId: '14', title: 'Database là gì?', description: 'Khái niệm cơ sở dữ liệu', duration: '25 min', order: 1 },
      { id: 'l61', courseId: '14', title: 'SQL SELECT', description: 'Truy vấn dữ liệu cơ bản', duration: '40 min', order: 2 },
      { id: 'l62', courseId: '14', title: 'WHERE & ORDER BY', description: 'Lọc và sắp xếp dữ liệu', duration: '35 min', order: 3 },
      { id: 'l63', courseId: '14', title: 'JOIN Tables', description: 'Kết hợp nhiều bảng', duration: '50 min', order: 4 },
      { id: 'l64', courseId: '14', title: 'GROUP BY & Aggregation', description: 'Tổng hợp dữ liệu', duration: '45 min', order: 5 },
      { id: 'l65', courseId: '14', title: 'Subqueries', description: 'Truy vấn lồng nhau', duration: '40 min', order: 6 },
      { id: 'l66', courseId: '14', title: 'Database Design', description: 'Thiết kế cơ sở dữ liệu', duration: '55 min', order: 7 },
    ]
  }
];

export const mockQuizzes: Quiz[] = [
  {
    id: 'q1',
    lessonId: 'l2',
    title: 'HTML Fundamentals Quiz',
    duration: 15,
    questions: [
      {
        id: 'qq1',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Hyper Transfer Markup Language',
          'Home Tool Markup Language'
        ],
        correctAnswer: 0
      },
      {
        id: 'qq2',
        question: 'Which tag is used to create a hyperlink?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correctAnswer: 1
      },
      {
        id: 'qq3',
        question: 'What is the correct HTML element for the largest heading?',
        options: ['<heading>', '<h6>', '<head>', '<h1>'],
        correctAnswer: 3
      },
      {
        id: 'qq4',
        question: 'Which attribute is used to provide an alternate text for an image?',
        options: ['src', 'title', 'alt', 'href'],
        correctAnswer: 2
      },
      {
        id: 'qq5',
        question: 'Which HTML element is used to define important text?',
        options: ['<strong>', '<b>', '<important>', '<i>'],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 'q2',
    lessonId: 'l4',
    title: 'JavaScript Essentials Quiz',
    duration: 20,
    questions: [
      {
        id: 'qq6',
        question: 'Which keyword is used to declare a variable in JavaScript?',
        options: ['var', 'let', 'const', 'All of the above'],
        correctAnswer: 3
      },
      {
        id: 'qq7',
        question: 'What is the output of: typeof null?',
        options: ['null', 'undefined', 'object', 'number'],
        correctAnswer: 2
      },
      {
        id: 'qq8',
        question: 'Which method is used to add an element at the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0
      },
      {
        id: 'qq9',
        question: 'What is the correct way to write an arrow function?',
        options: [
          'function = () => {}',
          'const func = () => {}',
          'func => () {}',
          'arrow function() {}'
        ],
        correctAnswer: 1
      },
      {
        id: 'qq10',
        question: 'Which operator is used for strict equality comparison?',
        options: ['==', '===', '!=', '='],
        correctAnswer: 1
      }
    ]
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    lessonId: 'l3',
    title: 'Bài tập CSS: Thiết kế Landing Page',
    description: 'Sử dụng CSS để thiết kế một landing page hoàn chỉnh theo mẫu đã cho. Bao gồm header, hero section, features và footer.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxFileSize: 10,
    allowedFormats: ['.html', '.css', '.zip'],
    maxScore: 100
  },
  {
    id: 'a2',
    lessonId: 'l5',
    title: 'Bài tập React: Xây dựng Todo App',
    description: 'Xây dựng ứng dụng Todo List sử dụng React với các chức năng: thêm, sửa, xóa, đánh dấu hoàn thành.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    maxFileSize: 20,
    allowedFormats: ['.zip', '.rar'],
    maxScore: 100
  },
  {
    id: 'a3',
    lessonId: 'l7',
    title: 'Phân tích dữ liệu với Python',
    description: 'Phân tích bộ dữ liệu sales.csv và tạo báo cáo với các biểu đồ visualization. Sử dụng Pandas và Matplotlib.',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    maxFileSize: 15,
    allowedFormats: ['.ipynb', '.py', '.zip'],
    maxScore: 100
  }
];

export const mockExercises: Exercise[] = [
  {
    id: 'e1',
    lessonId: 'l2',
    title: 'Bài tập thực hành HTML',
    description: 'Hoàn thành các bài tập điền code HTML để củng cố kiến thức.',
    type: 'fill-blank',
    timeLimit: 15,
    questions: [
      {
        id: 'eq1',
        question: 'Thẻ HTML nào dùng để tạo đoạn văn bản?',
        type: 'fill-blank',
        placeholder: 'Nhập tên thẻ (ví dụ: div)',
        expectedAnswer: 'p',
        hints: ['Đây là viết tắt của paragraph'],
        points: 10
      },
      {
        id: 'eq2',
        question: 'Thuộc tính nào dùng để thêm link vào thẻ <a>?',
        type: 'fill-blank',
        placeholder: 'Nhập tên thuộc tính',
        expectedAnswer: 'href',
        hints: ['Viết tắt của Hypertext Reference'],
        points: 10
      },
      {
        id: 'eq3',
        question: 'Thẻ HTML nào dùng để tạo danh sách không có thứ tự?',
        type: 'fill-blank',
        placeholder: 'Nhập tên thẻ',
        expectedAnswer: 'ul',
        hints: ['Viết tắt của Unordered List'],
        points: 10
      }
    ]
  },
  {
    id: 'e2',
    lessonId: 'l4',
    title: 'Bài tập lập trình JavaScript',
    description: 'Viết các đoạn code JavaScript để giải quyết các bài toán.',
    type: 'coding',
    timeLimit: 30,
    questions: [
      {
        id: 'eq4',
        question: 'Viết hàm tính tổng các số từ 1 đến n (sử dụng vòng lặp for)',
        type: 'coding',
        placeholder: 'function sum(n) {\n  // Code của bạn\n}',
        expectedAnswer: 'for,let,sum,return,i++',
        hints: ['Sử dụng vòng lặp for với biến đếm i', 'Tạo biến tổng và cộng dồn trong mỗi lần lặp'],
        points: 25
      },
      {
        id: 'eq5',
        question: 'Viết hàm kiểm tra số nguyên tố',
        type: 'coding',
        placeholder: 'function isPrime(n) {\n  // Code của bạn\n}',
        expectedAnswer: 'for,if,return,true,false,%',
        hints: ['Số nguyên tố chỉ chia hết cho 1 và chính nó', 'Kiểm tra từ 2 đến căn bậc 2 của n'],
        points: 30
      },
      {
        id: 'eq6',
        question: 'Viết hàm đảo ngược chuỗi',
        type: 'coding',
        placeholder: 'function reverseString(str) {\n  // Code của bạn\n}',
        expectedAnswer: 'split,reverse,join',
        hints: ['Có thể dùng split() để chuyển thành mảng', 'Dùng reverse() để đảo ngược mảng'],
        points: 20
      }
    ]
  },
  {
    id: 'e3',
    lessonId: 'l8',
    title: 'Bài tập Pandas cơ bản',
    description: 'Trả lời các câu hỏi về thư viện Pandas trong Python.',
    type: 'short-answer',
    timeLimit: 20,
    questions: [
      {
        id: 'eq7',
        question: 'Hàm nào trong Pandas dùng để đọc file CSV?',
        type: 'short-answer',
        placeholder: 'Nhập tên hàm...',
        expectedAnswer: 'read_csv',
        hints: ['Bắt đầu bằng read_'],
        points: 15
      },
      {
        id: 'eq8',
        question: 'Phương thức nào dùng để xem 5 dòng đầu tiên của DataFrame?',
        type: 'short-answer',
        placeholder: 'Nhập tên phương thức...',
        expectedAnswer: 'head',
        hints: ['Tên tiếng Anh của "đầu"'],
        points: 15
      }
    ]
  }
];

export const mockReviews = [
  {
    id: 'r1',
    userId: 'u1',
    courseId: '1',
    rating: 5,
    comment: 'Excellent course! The instructor explains everything clearly. Highly recommended for beginners.',
    createdAt: new Date('2024-01-15'),
    userName: 'Nguyen Van A'
  },
  {
    id: 'r2',
    userId: 'u2',
    courseId: '1',
    rating: 4,
    comment: 'Great content and practical projects. Wish there were more advanced topics.',
    createdAt: new Date('2024-01-20'),
    userName: 'Tran Thi B'
  },
  {
    id: 'r3',
    userId: 'u3',
    courseId: '2',
    rating: 5,
    comment: 'Prof. Andrew Ng is amazing! The best ML course I have ever taken.',
    createdAt: new Date('2024-02-01'),
    userName: 'Le Van C'
  }
];
