import {useStates} from 'react'
import BottomNav from '../component/BottomNav'

export default function Settings() {
  const [theme, setTheme] = useState('light')
  const [colorblindMode, setColorblindMode] = useState('none')
  const [fontSize, setFontSize] = useState(16)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
    }
  }

  return (
    <>
      <main style={{padding:20}}>
        <h2>Settings</h2>
        <p>User settings and preferences (placeholder).</p>
      </main>
      <BottomNav />
    </>
  )
}
