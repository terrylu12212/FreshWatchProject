import './Homepage.css'

const Homepage = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return (
    <div>
      <h2>Homepage</h2>
      <button className="logout" onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Homepage