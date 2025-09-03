import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: '', availableCopies: 1 });
  const [newBookCategory, setNewBookCategory] = useState('');

  // Remove hardcoded bookCategories and use fetched categories from backend
  const [bookCategories, setBookCategories] = useState([]);

  const [newUser, setNewUser] = useState({ username: '', password: '' }); 
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const booksPerPage = 10;

  const [memberPage, setMemberPage] = useState(0);
  const [memberTotalPages, setMemberTotalPages] = useState(0);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const [txnPage, setTxnPage] = useState(0);
  const [txnTotalPages, setTxnTotalPages] = useState(0);
  const [txnSearchQuery, setTxnSearchQuery] = useState('');

  const [memberId, setMemberId] = useState('');
  const [bookId, setBookId] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [message, setMessage] = useState('');

  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('books');

  const [bookSortKey, setBookSortKey] = useState('id');
  const [bookSortOrder, setBookSortOrder] = useState('asc');

  const styles = {
    sidebar: {
      width: '220px',
      background: '#22223b',
      color: '#fff',
      minHeight: '100vh',
      padding: '30px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 2,
    },
    sidebarButton: (tab) => ({
      width: '90%',
      padding: '14px',
      margin: '10px 0',
      background: activeTab === tab ? '#4a4e69' : 'transparent',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '16px',
      textAlign: 'left',
      transition: 'background 0.2s'
    }),
    main: {
      marginLeft: '240px',
      padding: '40px 30px',
      background: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    },
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '20px',
      marginTop: '30px',
      flexWrap: 'wrap'
    },
    section: {
      backgroundColor: '#fdfdfd',
      padding: '30px',
      flex: 1,
      minWidth: '300px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    heading: {
      textAlign: 'center',
      fontSize: '22px',
      marginBottom: '10px',
      color: '#333'
    },
    input: {
      padding: '10px 14px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '16px'
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '12px',
      fontSize: '16px',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      overflow: 'hidden',
      marginTop: '15px'
    },
    th: {
      background: '#f4f6fb',
      color: '#22223b',
      fontWeight: 600,
      padding: '14px 12px',
      fontSize: '16px',
      borderBottom: '2px solid #e0e3eb',
      textAlign: 'left'
    },
    td: {
      padding: '12px',
      fontSize: '15px',
      color: '#333',
      borderBottom: '1px solid #f0f0f0'
    },
    trHover: {
      transition: 'background 0.2s',
      cursor: 'pointer'
    },
    message: {
      color: '#007bff',
      fontWeight: 'bold',
      marginTop: '10px'
    }
  };

  // Data fetchers
  const fetchBooks = () => {
    let endpoint = searchQuery.trim()
      ? `http://localhost:8080/api/books/search?query=${searchQuery}&page=${currentPage}&size=${booksPerPage}`
      : `http://localhost:8080/api/books?page=${currentPage}&size=${booksPerPage}`;
    if (categoryFilter) {
      endpoint += `&category=${encodeURIComponent(categoryFilter)}`;
    }
    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      setBooks(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    }).catch(err => console.error('Failed to fetch books:', err));
  };

  const fetchRequests = () => {
    axios.get('http://localhost:8080/api/dashboard/admin/bookRequest', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRequests(res.data || []))
      .catch(err => console.error('Failed to fetch requests:', err));
  };

  const fetchMembers = () => {
    const endpoint = memberSearchQuery.trim()
      ? `http://localhost:8080/api/dashboard/admin/members/search?query=${memberSearchQuery}&page=${memberPage}&size=10`
      : `http://localhost:8080/api/dashboard/admin/members?page=${memberPage}&size=10`;

    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setMembers(res.data.content || []);
      setMemberTotalPages(res.data.totalPages || 1);
    }).catch(err => console.error('Failed to fetch members:', err));
  };

  const fetchTransactions = () => {
    const endpoint = txnSearchQuery.trim()
      ? `http://localhost:8080/api/transactions/search?query=${txnSearchQuery}&page=${txnPage}&size=10`
      : `http://localhost:8080/api/transactions/all?page=${txnPage}&size=10`;

    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setTransactions(res.data.content || []);
      setTxnTotalPages(res.data.totalPages || 1);
    }).catch(err => console.error('Failed to fetch transactions:', err));
  };

  // Fetch categories from backend
  const fetchCategories = () => {
    axios.get('http://localhost:8080/api/books/category', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBookCategories(res.data || []))
      .catch(err => console.error('Failed to fetch categories:', err));
  };

  // CRUD handlers
  const handleAddBook = () => {
    if (
      !newBook.title.trim() ||
      !newBook.author.trim() ||
      !newBook.isbn.trim() ||
      !newBook.category.trim() ||
      !newBook.availableCopies
    ) {
      alert("Please fill all fields to add a book.");
      return;
    }
    axios.post('http://localhost:8080/api/books', newBook, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      fetchBooks();
      setNewBook({ title: '', author: '', isbn: '', category: '', availableCopies: 1 });
    }).catch(() => alert("Failed to add book."));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => fetchBooks())
      .catch(() => alert("Failed to delete book."));
  };

  const handleEdit = (book) => setEditingBook(book);

  const handleUpdate = () => {
    axios.put(`http://localhost:8080/api/books/${editingBook.id}`, editingBook, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      fetchBooks();
      setEditingBook(null);
    }).catch(() => alert("Failed to update book."));
  };

  const handleAddUser = () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      alert("Username and password are required.");
      return;
    }
    axios.post('http://localhost:8080/api/auth/register', newUser, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      alert("User registered successfully!");
      setNewUser({ username: '', password: '' });
    }).catch(err => {
      console.error("User registration failed:", err);
      alert("Failed to register user.");
    });
  };

  const handleApprove = (id) => {
    axios.post(`http://localhost:8080/api/book-request/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => fetchRequests())
      .catch(() => alert("Failed to approve request."));
  };

  const handleReject = (id) => {
    axios.put(`http://localhost:8080/api/book-request/${id}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => fetchRequests())
      .catch(() => alert("Failed to reject request."));
  };

  const handleAddTransaction = async () => {
    if (
      !memberId.trim() ||
      !bookId.trim() ||
      !borrowDate.trim()
    ) {
      setMessage("Please enter Member ID, Book ID, and Borrow Date.");
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      // Check how many books are currently issued to this member
      const issuedRes = await axios.get(
        `http://localhost:8080/api/transactions/member/${memberId}?status=ISSUED`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const issuedBooks = issuedRes.data?.content || issuedRes.data || [];
      if (issuedBooks.length >= 5) {
        setMessage("Cannot issue more than 5 books to a member.");
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      // Proceed to create transaction
      
      const response = await axios.post(
        'http://localhost:8080/api/transactions/issue',
        {
          memberId: parseInt(memberId),
          bookId: parseInt(bookId),
          borrowDate: borrowDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(`Transaction created successfully! ID: ${response.data.id}`);
      setMemberId('');
      setBookId('');
      setBorrowDate('');
      fetchBooks();
    } catch (error) {
      if (error.response) {
        setMessage(`Failed: ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        setMessage('No response from server.');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

const handleReturnBook = (id) => {
  axios.put(`http://localhost:8080/api/transactions/return/${id}`, null, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(() => fetchTransactions())
    .catch(err => alert(`Failed to return book: ${err.response?.data || err.message}`));
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    navigate("/");
  };

  const getRowStyleByStatus = (status) => {
    switch (status) {
      case "ISSUED":
        return { backgroundColor: '#f9da72ff' }; // Yellow
      case "RETURNED":
        return { backgroundColor: '#76fd95ff' }; // Green
      case "OVERDUE":
        return { backgroundColor: '#f79ca3ff' }; // Red
      default:
        return {};
    }
  };

  // Helper to get unique categories from books
  const uniqueCategories = Array.from(new Set(books.map(book => book.category).filter(Boolean)));

  // Sorting function
  const sortedBooks = [...books].sort((a, b) => {
    if (a[bookSortKey] < b[bookSortKey]) return bookSortOrder === 'asc' ? -1 : 1;
    if (a[bookSortKey] > b[bookSortKey]) return bookSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    if (!token || !roles.includes("ROLE_ADMIN")) {
      navigate("/unauthorized");
      return;
    }
    fetchBooks();
    fetchRequests();
    fetchMembers();
    fetchTransactions();
    fetchCategories(); // Fetch categories on mount
  // eslint-disable-next-line
  }, [navigate, token, currentPage, searchQuery, categoryFilter, memberPage, memberSearchQuery, txnPage, txnSearchQuery]);

  // Responsive styles using CSS-in-JS
  const responsiveStyles = `
    @media (max-width: 900px) {
      .admin-main {
        margin-left: 0 !important;
        padding: 16px !important;
      }
      .admin-sidebar {
        position: static !important;
        width: 100% !important;
        min-height: unset !important;
        flex-direction: row !important;
        padding: 10px 0 !important;
        justify-content: space-between !important;
        z-index: 1 !important;
      }
      .admin-sidebar button {
        font-size: 14px !important;
        padding: 10px !important;
        width: auto !important;
        margin: 0 4px !important;
      }
      .admin-section {
        padding: 16px !important;
        min-width: unset !important;
      }
      .admin-table th, .admin-table td {
        padding: 8px !important;
        font-size: 13px !important;
      }
      .admin-table {
        font-size: 13px !important;
        overflow-x: auto !important;
        display: block !important;
      }
    }
    @media (max-width: 600px) {
      .admin-main {
        padding: 8px !important;
      }
      .admin-section {
        padding: 8px !important;
      }
      .admin-heading {
        font-size: 18px !important;
      }
      .admin-table th, .admin-table td {
        font-size: 12px !important;
        padding: 6px !important;
      }
    }
  `;

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = responsiveStyles;
    document.head.appendChild(styleTag);
    return () => { document.head.removeChild(styleTag); };
  }, []);

  // Sidebar button helper
  const sidebarButton = (tab, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={styles.sidebarButton(tab)}
    >
      {label}
    </button>
  );

  const handleAddBookCategory = () => {
    const cat = newBookCategory.trim();
    if (!cat) {
      setMessage("Category name cannot be empty.");
      return;
    }
    if (bookCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase())) {
      setMessage("Category already exists.");
      return;
    }
    // Optionally, send to backend if you want to persist new categories
    setBookCategories([...bookCategories, cat]);
    setNewBookCategory('');
    setMessage("Category added successfully.");
  };

  return (
    <div>
      {/* Sidebar */}
      <div className="admin-sidebar" style={styles.sidebar}>
        <h2 style={{ marginBottom: '40px', fontSize: '22px', letterSpacing: '1px' }}>Admin Panel</h2>
        {sidebarButton('books', 'Books')}
        {sidebarButton('requests', 'Requests')}
        {sidebarButton('members', 'Users')}
        {sidebarButton('transactions', 'Transactions')}
        <div style={{ flex: 1 }} />
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '12px 0',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '90%',
            marginBottom: '50px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-main" style={styles.main}>
        <h1 style={{ marginBottom: '30px', color: '#22223b' }}>Admin Dashboard</h1>

        {/* Books Tab */}
        {activeTab === 'books' && (
          <>
            <div style={styles.container}>
              <section className="admin-section" style={styles.section}>
                <h3 className="admin-heading" style={styles.heading}>Add New Book</h3>
                <input
                  style={styles.input}
                  placeholder="Title"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Author"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="ISBN"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                />
                <select
                  style={styles.input}
                  value={newBook.category}
                  onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {bookCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    style={styles.input}
                    placeholder="Add new category"
                    value={newBookCategory}
                    onChange={e => setNewBookCategory(e.target.value)}
                  />
                  <button
                    style={{ ...styles.button, padding: '8px 16px', fontSize: '15px' }}
                    type="button"
                    onClick={handleAddBookCategory}
                  >
                    Add Category
                  </button>
                </div>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  placeholder="Available Copies"
                  value={newBook.availableCopies}
                  onChange={(e) => setNewBook({ ...newBook, availableCopies: Number(e.target.value) })}
                />
                <button style={styles.button} onClick={handleAddBook}>Add Book</button>
                {message && <div style={styles.message}>{message}</div>}
              </section>
            </div>
            <section className="admin-section" style={{ marginTop: "30px" }}>
              <h3>All Books (Page {currentPage + 1})</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ marginRight: 16, padding: '5px', width: '220px' }}
                />
                <label style={{ marginRight: 8, fontWeight: 500 }}>Sort by:</label>
                <select
                  value={bookSortKey}
                  onChange={e => setBookSortKey(e.target.value)}
                  style={{ marginRight: 8, padding: '6px', borderRadius: 6, border: '1px solid #ccc' }}
                >
                  <option value="id">Book ID</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="isbn">ISBN</option>
                  <option value="category">Category</option>
                  <option value="availableCopies">Available</option>
                </select>
                <button
                  onClick={() => setBookSortOrder(bookSortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    background: '#f4f6fb',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                  title={`Sort ${bookSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {bookSortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              {books.length === 0 ? <p>No books available.</p> :
                <table className="admin-table" style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Book ID</th>
                      <th style={styles.th}>Title</th>
                      <th style={styles.th}>Author</th>
                      <th style={styles.th}>ISBN</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Available</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBooks.map((book, idx) => (
                      <tr
                        key={book.id}
                        style={{
                          ...styles.trHover,
                          background: idx % 2 === 0 ? '#fafbfc' : '#fff'
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = '#f0f4fa')}
                        onMouseOut={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fafbfc' : '#fff')}
                      >
                        <td style={styles.td}>{book.id}</td>
                        <td style={styles.td}>{book.title}</td>
                        <td style={styles.td}>{book.author}</td>
                        <td style={styles.td}>{book.isbn}</td>
                        <td style={styles.td}>{book.category}</td>
                        <td style={styles.td}>{book.availableCopies}</td>
                        <td style={styles.td}>
                          {editingBook?.id === book.id ? (
                            <>
                              <button onClick={handleUpdate}  style={{ marginRight: '10px' }}>Save</button>
                              <button onClick={() => setEditingBook(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(book)}  style={{ marginRight: '10px' }} >Edit</button>
                              <button onClick={() => handleDelete(book.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
              <div style={{ marginTop: "10px" }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i)} disabled={currentPage === i} style={{ marginRight: "5px" }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <section className="admin-section" style={{ marginTop: "10px" }}>
            <h3>Pending Book Requests</h3>
            {requests.length === 0 ? (
              <p>No pending requests.</p>
            ) : (
              <table className="admin-table" style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Author</th>
                    <th style={styles.th}>ISBN</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Requested On</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={styles.td}>{req.title}</td>
                      <td style={styles.td}>{req.author}</td>
                      <td style={styles.td}>{req.isbn}</td>
                      <td style={styles.td}>{req.category}</td>
                      <td style={styles.td}>{new Date(req.requestedDate).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleApprove(req.id)} style={{ marginRight: '10px' }}>Approve</button>
                        <button onClick={() => handleReject(req.id)}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <>
            <div style={styles.container}>
              <section className="admin-section" style={styles.section}>
                <h3 className="admin-heading" style={styles.heading}>Add New User</h3>
                <input style={styles.input} placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
                <input style={styles.input} placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <button style={styles.button} onClick={handleAddUser}>Add User</button>
              </section>
            </div>
            <input
              style={{ ...styles.input, marginBottom: '10px', marginTop: '20px' }}
              placeholder="Search Members..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
            />
            <section className="admin-section" style={{ marginTop: "10px" }}>
              <h3>All Members</h3>
              {members.length === 0 ? <p>No members found.</p> :
                <table className="admin-table" style={styles.table}>
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      <th style={styles.th}>Member ID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Student ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => (
                      <tr key={member.id}>
                        <td style={styles.td}>{member.id}</td>
                        <td style={styles.td}>{member.name}</td>
                        <td style={styles.td}>{member.email}</td>
                        <td style={styles.td}>{member.phone}</td>
                        <td style={styles.td}>{member.studentId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
            </section>
            <div style={{ marginTop: '10px' }}>
              {Array.from({ length: memberTotalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setMemberPage(i)}
                  disabled={memberPage === i}
                  style={{ marginRight: '5px' }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            <div style={styles.container}>
              <section className="admin-section" style={styles.section}>
                <h3 className="admin-heading" style={styles.heading}>Add New Transaction</h3>
                <input
                  style={styles.input}
                  placeholder="Member ID"
                  type="number"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Book ID"
                  type="number"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Borrow Date (yyyy-mm-dd)"
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                />
                <button style={styles.button} onClick={handleAddTransaction}>
                  Add Transaction
                </button>
                {message && <div style={styles.message}>{message}</div>}
              </section>
            </div>
            <input
              style={{ ...styles.input, marginBottom: '10px', marginTop: '20px' }}
              placeholder="Search Transactions..."
              value={txnSearchQuery}
              onChange={(e) => setTxnSearchQuery(e.target.value)}
            />
            <section className="admin-section" style={{ marginTop: "10px" }}>
              <h3>All Transactions</h3>
              {transactions.length === 0 ? (
                <p>No transactions found.</p>
              ) : (
                <table className="admin-table" style={styles.table}>
                  <thead style={{ backgroundColor: '#f2f2f2' }}>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Member ID</th>
                      <th style={styles.th}>Book ID</th>
                      <th style={styles.th}>Borrow Date</th>
                      <th style={styles.th}>Due Date</th>
                      <th style={styles.th}>Return Date</th>
                      <th style={styles.th}>Fine</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(txn => (
                      <tr key={txn.id} style={getRowStyleByStatus(txn.status)}>
                        <td style={styles.td}>{txn.id}</td>
                        <td style={styles.td}>{txn.member?.id}</td>
                        <td style={styles.td}>{txn.book?.id}</td>
                        <td style={styles.td}>{txn.borrowDate}</td>
                        <td style={styles.td}>{txn.dueDate}</td>
                        <td style={styles.td}>{txn.returnDate || "Not Returned"}</td>
                        <td style={styles.td}>{txn.fine}</td>
                        <td style={styles.td}>{txn.status}</td>
                        <td style={styles.td}>
                          {txn.status === "RETURNED" ? (
                            "Returned"
                          ) : (
                            <button onClick={() => handleReturnBook(txn.id)}>Mark as Returned</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
            <div style={{ marginTop: '10px' }}>
              {Array.from({ length: txnTotalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setTxnPage(i)}
                  disabled={txnPage === i}
                  style={{ marginRight: '5px' }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );


}

export default AdminDashboard;
