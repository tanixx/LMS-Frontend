import axios from 'axios';
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

  const token = localStorage.getItem("token");
  const id=memberProfile ? memberProfile.id : localStorage.getItem("id");


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
    }
  };

  const fetchMemberProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/members/me/info", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        setMemberProfile(res.data);
        console.log("Member profile fetched successfully:", res.data);
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
    console.log("Book requests fetched successfully:", res.data);
  } catch (err) {
    console.error("Failed to fetch book requests:", err);
    alert("Failed to fetch book requests.");
  }
};




useEffect(() => {
  if (memberProfile?.id) {
    fetchRequests();
  }
}, [memberProfile]);


  const handleUpdateProfile = async () => {
  try {
    const res = await axios.put("http://localhost:8080/api/members/me", form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMemberProfile(res.data);
    alert("Profile updated successfully.");
  } catch (err) {
    alert("Failed to update member profile.");
    console.error(err);
  }
};

  const handleCreateMember = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/members/me/create", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemberProfile(res.data);
      setIsProfileCreated(true);
      alert("Profile created successfully.");
      if (isPasswordChanged) setShowSetupAlert(false);
    } catch (err) {
      alert("Failed to create member profile.");
      console.error(err);
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
      alert("Password changed successfully.");
      setOldPassword('');
      setNewPassword('');
      if (isProfileCreated) setShowSetupAlert(false);
    } catch (err) {
      alert("Failed to change password.");
      console.error(err);
    }
  };
  const handleRequest = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/book-request/request", {
        title,
        author,
        category,
        isbn
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Book request submitted successfully.");
      setReqTitle('');
      setReqAuthor('');
      setReqCategory('');
      setReqISBN('');
    } catch (err) {
      alert("Failed to request book.");
      console.error(err);
    }
  };

const fetchTransactions = () => {
  if (!memberProfile?.id) return;
  axios.get(`http://localhost:8080/api/transactions/member/${memberProfile.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    setTransactions(response.data || []);
    console.log("Transactions fetched successfully:", response.data);
  }).catch(err => console.error('Failed to fetch transactions:', err));
};

useEffect(() => {
  if (memberProfile?.id) {
    fetchTransactions();
  }
}, [memberProfile]);

  useEffect(() => {
    fetchTransactions();
  }, [id, token]);
  const fetchBooks = () => {
    const endpoint = searchQuery.trim()
      ? `http://localhost:8080/api/books/search?query=${searchQuery}&page=${currentPage}&size=10`
      : `http://localhost:8080/api/books?page=${currentPage}&size=10`;

    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      setBooks(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    }).catch(err => console.error('Failed to fetch books:', err));
  };

  useEffect(() => {
    fetchMemberProfile();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Student Dashboard</h2>
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

      <div style={styles.container}>
       <section style={styles.section}>
  <h3 style={styles.heading}>Member Information</h3>

  {memberProfile === null ? (
    <>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} />
      <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
      <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={styles.input} />
      <input placeholder="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} style={styles.input} />
      <button onClick={handleCreateMember} style={styles.button}>Create Profile</button>
    </>
  ) : (
    <>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} />
      <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
      <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={styles.input} />
      <input placeholder="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} style={styles.input} />
      <button onClick={handleUpdateProfile} style={{ ...styles.button, backgroundColor: '#28a745' }}>Update Profile</button>
    </>
  )}
</section>


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
          <input
            type="Category"
            placeholder="Category"
            value={category}
            onChange={(e) => setReqCategory(e.target.value)}
            style={styles.input}
          />
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
        </section>
      </div>
      <section style={{ marginTop: "30px"}}>
        <h3>My Requests</h3>
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>Request ID</th><th>Title</th><th>Author</th><th>ISBN</th><th>Category</th><th>Request Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.title}</td>
                  <td>{request.author}</td>
                  <td>{request.isbn}</td>
                  <td>{request.category}</td>
<td>{new Date(request.requestedDate).toLocaleDateString()}</td>
                  <td>{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </section>
      <section style={{ marginTop: "30px"}}>
        <h3>My Transactions</h3>
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                  
      <th>Book ID</th>
      <th>Title</th>
      <th>Author</th>
      <th>ISBN</th>
      <th>Category</th>
      <th>Borrow Date</th>
      <th>Due Date</th>
      <th>Return Date</th>
      <th>Status</th>
      <th>Fine</th>
    </tr>
            </thead>
            <tbody>
{transactions.map(transaction => {
  const book = transaction.book;
  const borrowDate = new Date(transaction.borrowDate).toLocaleDateString();
  const dueDate = new Date(transaction.dueDate).toLocaleDateString();
  const returnDate = transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : "Not returned";

  return (
    <tr key={transaction.id}>
      <td>{book.id}</td>
      <td>{book.title}</td>
      <td>{book.author}</td>
      <td>{book.isbn}</td>
      <td>{book.category}</td>
      <td>{borrowDate}</td>
      <td>{dueDate}</td>
      <td>{returnDate}</td>
      <td>{transaction.status}</td>
      <td>{transaction.fine}</td>
    </tr>
  );
})}

          
            </tbody>
          </table>
      </section>
      <section style={{ marginTop: "30px" }}>
        <h3>Available Books (Page {currentPage + 1})</h3>
        <input
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '10px', padding: '5px', width: '300px' }}
        />
        {books.length === 0 ? (
          <p>No books available.</p>
        ) : (
          <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>Book ID</th><th>Title</th><th>Author</th><th>ISBN</th><th>Category</th><th>Available</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.category}</td>
                  <td>{book.availableCopies}</td>
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
    </div>
  );
}

export default MemberDashboard;
