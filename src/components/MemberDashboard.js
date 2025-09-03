import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // <-- use named import
import { useEffect, useState } from 'react';

function MemberDashboard() {
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', studentId: '' });
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSetupAlert, setShowSetupAlert] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [title, setReqTitle] = useState('');
  const [author, setReqAuthor] = useState('');
  const [category, setReqCategory] = useState('');
  const [isbn, setReqISBN] = useState('');
  const [requests, setRequest] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); 
  const [newCategory, setNewCategory] = useState('');

  const token = localStorage.getItem("token");

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
      transition: 'width 0.3s',
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
      fontFamily: 'Arial, sans-serif',
      transition: 'margin-left 0.3s',
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
      fontSize: '16px',
      width: '100%',
      boxSizing: 'border-box'
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '12px',
      fontSize: '16px',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      width: '100%',
      boxSizing: 'border-box'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      overflow: 'hidden',
      marginTop: '15px',
      fontSize: '15px'
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
    }
  };

  const [bookCategories, setBookCategories] = useState([]);
   
  // Fetch functions
  const fetchMemberProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/members/me/info", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 200) {
        setMemberProfile({ ...res.data, isProfileUpdated: !!res.data.updatedAt }); // or use your own flag
        setForm(res.data);
        setIsProfileCreated(true);
      } else if (res.status === 204) {
        setMemberProfile(null);
        setShowSetupAlert(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 204) {
        setMemberProfile(null);
        setShowSetupAlert(true);
      } else {
        console.error("Failed to fetch member profile", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      if (!memberProfile?.id) return;
      const res = await axios.get(`http://localhost:8080/api/book-request/member/${memberProfile.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequest(res.data || []);
    } catch (err) {
      console.error("Failed to fetch book requests:", err);
    }
  };

  const fetchTransactions = () => {
    if (!memberProfile?.id) return;
    axios.get(`http://localhost:8080/api/transactions/member/${memberProfile.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      setTransactions(response.data || []);
    }).catch(err => console.error('Failed to fetch transactions:', err));
  };

  const fetchBooks = () => {
    const endpoint = searchQuery.trim()
      ? `http://localhost:8080/api/books/search?query=${searchQuery}&page=${currentPage}&size=10&sort=${sortBy},${sortOrder}`
      : `http://localhost:8080/api/books?page=${currentPage}&size=10&sort=${sortBy},${sortOrder}`;

    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      setBooks(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    }).catch(err => console.error('Failed to fetch books:', err));
  };

  // Effects
  useEffect(() => { fetchMemberProfile(); }, []);
  useEffect(() => { fetchBooks(); }, [currentPage, searchQuery, sortBy, sortOrder]);
  useEffect(() => { if (memberProfile?.id) fetchRequests(); }, [memberProfile]);
  useEffect(() => { if (memberProfile?.id) fetchTransactions(); }, [memberProfile]);
  useEffect(() => {
    // Fetch categories from backend when component mounts
    axios.get('http://localhost:8080/api/books/category', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBookCategories(res.data || []))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, [token]);

  // Handlers
  const handleUpdateProfile = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/members/me/create",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemberProfile({ ...res.data, isProfileUpdated: true });
      showMessage("Profile updated successfully.", "success");
    } catch (err) {
      showMessage(err?.response?.data || "Failed to update member profile.", "error");
    }
  };

  const handleCreateMember = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/members/me/create", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemberProfile(res.data);
      setIsProfileCreated(true);
      showMessage("Profile created successfully.", "success");
      if (isPasswordChanged) setShowSetupAlert(false);
    } catch (err) {
      showMessage(err?.response?.data || "Failed to create member profile.", "error");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.patch("http://localhost:8080/api/members/me/password", {
        currentPassword : oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsPasswordChanged(true);
      showMessage("Password changed successfully.", "success");
      setOldPassword('');
      setNewPassword('');
      if (isProfileCreated) setShowSetupAlert(false);
    } catch (err) {
      showMessage(err?.response?.data || "Failed to change password.", "error");
    }
  };

  const handleRequest = async () => {
    if (
      !title.trim() ||
      !author.trim() ||
      !category.trim() ||
      !isbn.trim()
    ) {
      showMessage("Please fill all fields to request a book.", "error");
      return;
    }
    try {
      await axios.post("http://localhost:8080/api/book-request/request", {
        memberId: memberProfile?.id,
        title,
        author,
        category,
        isbn
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage("Book request submitted successfully.", "success");
      setReqTitle('');
      setReqAuthor('');
      setReqCategory('');
      setReqISBN('');
      fetchRequests();
    } catch (err) {
      showMessage(err?.response?.data || "Failed to request book.", "error");
    }
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleAddCategory = () => {
    const cat = newCategory.trim();
    if (!cat) {
      showMessage("Category name cannot be empty.", "error");
      return;
    }
    if (bookCategories.map(c => c.toLowerCase()).includes(cat.toLowerCase())) {
      showMessage("Category already exists.", "error");
      return;
    }
    setBookCategories([...bookCategories, cat]);
    setNewCategory('');
    showMessage("Category added successfully.", "success");
  };

  const handleDownloadTransactionsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(10); // Set font size for all text to 10
    doc.text("Transaction History Report", 14, 14); // Move title up and keep it small

    const tableColumn = [
      "Book ID",
      "Title",
      "Author",
      "ISBN",
      "Category",
      "Borrow Date",
      "Due Date",
      "Return Date",
      "Status",
      "Fine"
    ];

    const tableRows = transactions.map(transaction => {
      const book = transaction.book;
      const borrowDate = new Date(transaction.borrowDate).toLocaleDateString();
      const dueDate = new Date(transaction.dueDate).toLocaleDateString();
      const returnDate = transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : "Not returned";
      return [
        book.id,
        book.title,
        book.author,
        book.isbn,
        book.category,
        borrowDate,
        dueDate,
        returnDate,
        transaction.status,
        transaction.fine
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20, // Start table closer to the top
      styles: { fontSize: 8 }, // Make table font even smaller if needed
      headStyles: { fontSize: 9 }, // Slightly larger for header
    });

    doc.save("transaction_history.pdf");
  };

  // Sidebar button helper
  const sidebarButton = (tab, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={styles.sidebarButton(tab)}
    >
      {label}
    </button>
  );

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 10000);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {/* Sidebar */}
      <div className="dashboard-sidebar" style={styles.sidebar}>
        <h2 style={{ marginBottom: '40px', fontSize: '22px', letterSpacing: '1px' }}>Student Panel</h2>
        {sidebarButton('profile', 'Profile')}
        {sidebarButton('password', 'Change Password')}
        {sidebarButton('requests', 'My Requests')}
        {sidebarButton('transactions', 'My Transactions')}
        {sidebarButton('books', 'Available Books')}
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
            marginTop: '30px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main" style={styles.main}>
        <h1 style={{ marginBottom: '30px', color: '#22223b' }}>Student Dashboard</h1>

        {/* Message Bar */}
        {message && (
          <div
            style={{
              background: messageType === 'error' ? '#ffeaea' : '#eafaf1',
              color: messageType === 'error' ? '#d32f2f' : '#2e7d32',
              border: `1px solid ${messageType === 'error' ? '#f5c6cb' : '#b7ebc6'}`,
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '18px',
              fontWeight: 500,
              fontSize: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            {message}
          </div>
        )}

        {showSetupAlert && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
            padding: '15px',
            borderRadius: '6px',
            marginTop: '20px'
          }}>
            <strong>Attention:</strong> You must complete your member profile and set your password before accessing book listings.
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <section className="dashboard-section" style={styles.section}>
            <h3 className="dashboard-heading" style={styles.heading}>Member Information</h3>
            {memberProfile === null ? (
              <>
                <label style={{ fontWeight: 500, marginBottom: 4 }}>Name</label>
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} />
                <label style={{ fontWeight: 500, marginBottom: 4 }}>Email</label>
                <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
                <label style={{ fontWeight: 500, marginBottom: 4 }}>Phone</label>
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={styles.input} />
                <label style={{ fontWeight: 500, marginBottom: 4 }}>Student ID</label>
                <input placeholder="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} style={styles.input} />
                <button onClick={handleCreateMember} style={styles.button}>Create Profile</button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 10 }}>
                  <strong>Name:</strong> {memberProfile.name}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <strong>Email:</strong>
                  <input
                    type="email"
                    value={form.email}
                    style={{ ...styles.input, marginLeft: 10, width: 250 }}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <strong>Phone:</strong>
                  <input
                    type="text"
                    value={form.phone}
                    style={{ ...styles.input, marginLeft: 10, width: 180 }}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <strong>Student ID:</strong> {memberProfile.studentId}
                </div>
                <button onClick={handleUpdateProfile} style={styles.button}>Save Changes</button>
              </>
            )}
          </section>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <section style={styles.section}>
            <h3 style={styles.heading}>Change Password</h3>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
            <button onClick={handlePasswordChange} style={styles.button}>
              Change Password
            </button>
          </section>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <section style={styles.section}>
            <h3 style={styles.heading}>Request New Book</h3>
            <input
              type="Title"
              placeholder="Title"
              value={title}
              onChange={(e) => setReqTitle(e.target.value)}
              style={styles.input}
            />
            <input
              type="Author"
              placeholder="Author"
              value={author}
              onChange={(e) => setReqAuthor(e.target.value)}
              style={styles.input}
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={category}
                onChange={e => setReqCategory(e.target.value)}
                style={styles.input}
              >
                <option value="">Select Category</option>
                {bookCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                style={{ ...styles.button, padding: '8px 16px', fontSize: '15px' }}
                onClick={() => setReqCategory('')}
                type="button"
              >
                Clear Category
              </button>
            </div>
            <input
              type="ISBN"
              placeholder="ISBN"
              value={isbn}
              onChange={(e) => setReqISBN(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleRequest} style={styles.button}>
              Request
            </button>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
              <input
                style={styles.input}
                placeholder="Add new category"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              />
              <button
                style={{ ...styles.button, padding: '8px 16px', fontSize: '15px' }}
                type="button"
                onClick={handleAddCategory}
              >
                Add Category
              </button>
            </div>
            <h3 style={{ marginTop: '30px' }}>My Requests</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Request ID</th><th style={styles.th}>Title</th><th style={styles.th}>Author</th><th style={styles.th}>ISBN</th><th style={styles.th}>Category</th><th style={styles.th}>Request Date</th><th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request.id}>
                    <td style={styles.td}>{request.id}</td>
                    <td style={styles.td}>{request.title}</td>
                    <td style={styles.td}>{request.author}</td>
                    <td style={styles.td}>{request.isbn}</td>
                    <td style={styles.td}>{request.category}</td>
                    <td style={styles.td}>{new Date(request.requestedDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{request.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <section style={styles.section}>
            <h3 style={styles.heading}>My Transactions</h3>
            <button
              style={{ ...styles.button, marginBottom: 16, width: "auto", maxWidth: 220 }}
              onClick={handleDownloadTransactionsPDF}
            >
              Download PDF Report
            </button>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Book ID</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Author</th>
                  <th style={styles.th}>ISBN</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Borrow Date</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Return Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Fine</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => {
                  const book = transaction.book;
                  const borrowDate = new Date(transaction.borrowDate).toLocaleDateString();
                  const dueDate = new Date(transaction.dueDate).toLocaleDateString();
                  const returnDate = transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : "Not returned";
                  return (
                    <tr key={transaction.id} style={getRowStyleByStatus(transaction.status)}>
                      <td style={styles.td}>{book.id}</td>
                      <td style={styles.td}>{book.title}</td>
                      <td style={styles.td}>{book.author}</td>
                      <td style={styles.td}>{book.isbn}</td>
                      <td style={styles.td}>{book.category}</td>
                      <td style={styles.td}>{borrowDate}</td>
                      <td style={styles.td}>{dueDate}</td>
                      <td style={styles.td}>{returnDate}</td>
                      <td style={styles.td}>{transaction.status}</td>
                      <td style={styles.td}>{transaction.fine}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <section style={styles.section}>
            <h3 style={styles.heading}>Available Books (Page {currentPage + 1})</h3>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <input
                placeholder="Search books..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ marginRight: 16, padding: '5px', width: '220px' }}
              />
              <label style={{ marginRight: 8, fontWeight: 500 }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ marginRight: 8, padding: '6px', borderRadius: 6, border: '1px solid #ccc' }}
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="isbn">ISBN</option>
                <option value="category">Category</option>
                <option value="availableCopies">Available</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: '#f4f6fb',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            {books.length === 0 ? (
              <p>No books available.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Book ID</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Author</th>
                    <th style={styles.th}>ISBN</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {[...books]
                    .sort((a, b) => {
                      if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
                      if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
                      return 0;
                    })
                    .map((book, idx) => (
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
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: "10px" }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  disabled={currentPage === i}
                  style={{ marginRight: "5px" }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
