import { ICalCalendar } from 'ical-generator'
import requireAuth from '../middleware/requireAuth.js'

export const getICalendar = async (req, res) => {
    try {
        const response = await fetch('http://localhost:4000/api/items', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || ''
            }
        })
        if (!response.ok) {
            throw Error('Failed to fetch items')
        }
        const items = await response.json()
        const iCalendar = new ICalCalendar()
        iCalendar.name = 'Item Expiration Dates'
        items.forEach(item => {
            const { name, expirationDate } = item
            if (!expirationDate || !name) return
            const start = new Date(expirationDate)
            if (Number.isNaN(start.getTime())) return
            const end = new Date(start)
            end.setDate(end.getDate() + 1)
            iCalendar.createEvent({
                start,
                end,
                summary: name,
                description: `Your ${name} will expire on ${start.toDateString()}`,
                allDay: true
            })
        })
        res.type('text/calendar; charset=utf-8')
        res.setHeader('Content-Disposition', 'attachment; filename="expiration_dates.ics"')
        res.send(iCalendar.toString())
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal server error')
    }
}