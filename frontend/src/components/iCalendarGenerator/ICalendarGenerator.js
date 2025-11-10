import { useState } from "react"
import './iCalendarGenerator.css'
import CalendarPopUp from "../calendarPopUp/calendarPopUp"

const ICalendarGenerator = () => {
    // calendar popup .............................
    const [open, setOpen] = useState(false);
    const handleClose = () => {
      setOpen(false);
    };

  const handleButton = async () => {
  try{
    setOpen(true);
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/iCalendar', {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
        if (!response.ok){
            throw Error('Failed to generate iCalendar')
        }
        console.log('success')
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'expiration_dates.ics')
        document.body.appendChild(link)
        link.click()
        // cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(link)
        }, 0)
    }
    catch(err){
        console.log(err)
    }
  }
  return (
    <div>
        <button onClick={handleButton} id="iCalButton">Generate Apple Calendar</button>
        <CalendarPopUp open={open} handleClose={handleClose}></CalendarPopUp>
    </div>
  )
}

export default ICalendarGenerator