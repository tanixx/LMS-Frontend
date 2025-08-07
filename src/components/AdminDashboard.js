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
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: '', availableCopies: 1 });

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

  

  const styles = {
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
    th: {
      padding: '8px',
      textAlign: 'left',
      borderBottom: '1px solid #ddd'
    },
    td: {
      padding: '8px',
      borderBottom: '1px solid #ddd'
    }
  };

  const fetchBooks = () => {
    const endpoint = searchQuery.trim()
      ? `http://localhost:8080/api/books/search?query=${searchQuery}&page=${currentPage}&size=${booksPerPage}`
      : `http://localhost:8080/api/books?page=${currentPage}&size=${booksPerPage}`;

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


  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
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

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => fetchBooks())
      .catch(() => alert("Failed to delete book."));
  };

  const handleEdit = (book) => setEditingBook(book);

  const handleAddTransaction = async () => {
  try {
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




  const handleUpdate = () => {
    axios.put(`http://localhost:8080/api/books/${editingBook.id}`, editingBook, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      fetchBooks();
      setEditingBook(null);
    }).catch(() => alert("Failed to update book."));
  };

  const handleReturnBook = (id) => {
  axios.put(`http://localhost:8080/api/transactions/return/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(() => fetchTransactions()) 
    .catch(err => alert(`Failed to return book: ${err.response?.data || err.message}`));
};


  const handleAddBook = () => {
    axios.post('http://localhost:8080/api/books', newBook, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      fetchBooks();
      setNewBook({ title: '', author: '', isbn: '', category: '', availableCopies: 1 });
    }).catch(() => alert("Failed to add book."));
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

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("roles");
  navigate("/");
};


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
}, [navigate, token, currentPage, searchQuery, memberPage, memberSearchQuery, txnPage, txnSearchQuery]);

  return (
    <div style={{ padding: "20px", fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
  <button
    onClick={handleLogout}
    style={{
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '10px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >
    Logout
  </button>
</div>


      <div style={styles.container}>
        <section style={styles.section}>
          <h3 style={styles.heading}>Add New Book</h3>
          <input style={styles.input} placeholder="Title" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} />
          <input style={styles.input} placeholder="Author" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} />
          <input style={styles.input} placeholder="ISBN" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} />
          <input style={styles.input} placeholder="Category" value={newBook.category} onChange={(e) => setNewBook({ ...newBook, category: e.target.value })} />
          <input style={styles.input} type="number" min="1" placeholder="Available Copies" value={newBook.availableCopies} onChange={(e) => setNewBook({ ...newBook, availableCopies: Number(e.target.value) })} />
          <button style={styles.button} onClick={handleAddBook}>Add Book</button>
        </section>

        <section style={styles.section}>
          <h3 style={styles.heading}>Add New User</h3>
          <input style={styles.input} placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
          <input style={styles.input} placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <button style={styles.button} onClick={handleAddUser}>Add User</button>
        </section>
    <section style={styles.section}>
      <h3 style={styles.heading}>Add New Transaction</h3>
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

      {/* Books Table */}
      <section style={{ marginTop: "30px" }}>
        <h3>All Books (Page {currentPage + 1})</h3>
        <input placeholder="Search books..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ marginBottom: '10px', padding: '5px', width: '300px' }} />
        {books.length === 0 ? <p>No books available.</p> :
          <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>Book ID</th><th>Title</th><th>Author</th><th>ISBN</th><th>Category</th><th>Available</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id} >
                  <td>{editingBook?.id === book.id ? <input value={editingBook.id} onChange={(e) => setEditingBook({ ...editingBook, id: e.target.value })} /> : book.id}</td>
                  <td>{editingBook?.id === book.id ? <input value={editingBook.title} onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })} /> : book.title}</td>
                  <td>{editingBook?.id === book.id ? <input value={editingBook.author} onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })} /> : book.author}</td>
                  <td>{editingBook?.id === book.id ? <input value={editingBook.isbn} onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })} /> : book.isbn}</td>
                  <td>{editingBook?.id === book.id ? <input value={editingBook.category} onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })} /> : book.category}</td>
                  <td>{editingBook?.id === book.id ? <input type="number" min="1" value={editingBook.availableCopies} onChange={(e) => setEditingBook({ ...editingBook, availableCopies: Number(e.target.value) })} /> : book.availableCopies}</td>
                  <td>
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

      {/* Book Requests */}
      <section style={{ marginTop: "30px" }}>
  <h3>Pending Book Requests</h3>
  {requests.length === 0 ? (
    <p>No pending requests.</p>
  ) : (
    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
      <thead style={{ backgroundColor: '#f2f2f2' }}>
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



      <input
  style={{ ...styles.input, marginBottom: '10px', marginTop: '20px' }}
  placeholder="Search Members..."
  value={memberSearchQuery}
  onChange={(e) => setMemberSearchQuery(e.target.value)}
/>

      {/* Member Table */}
      <section style={{ marginTop: "10px" }}>
        <h3>All Members</h3>
        {members.length === 0 ? <p>No members found.</p> :
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
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



<input
  style={{ ...styles.input, marginBottom: '10px', marginTop: '20px' }}
  placeholder="Search Transactions..."
  value={txnSearchQuery}
  onChange={(e) => setTxnSearchQuery(e.target.value)}
/>

      {/* Transactions Table */}
      <section style={{ marginTop: "10px" }}>
  <h3>All Transactions</h3>
  {transactions.length === 0 ? (
    <p>No transactions found.</p>
  ) : (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
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
      <tr key={txn.id}>
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

    </div>


    
  );


}

export default AdminDashboard;
