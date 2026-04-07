const { Client } = require('pg')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

async function main(){
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_URL not set in environment')
    process.exit(1)
  }

  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  try {
    const res = await client.query("SELECT id FROM shipments LIMIT 1")
    if (res.rows.length === 0){
      console.error('No shipments found in DB')
      process.exit(1)
    }
    const id = res.rows[0].id
    console.log('Found shipment id:', id)

    // Prepare a small dummy file (text) to upload
    const tmpPath = './scripts/_dummy.txt'
    fs.writeFileSync(tmpPath, 'dummy')

    const form = new FormData()
    form.append('shipmentInvoiceFile', fs.createReadStream(tmpPath))
    form.append('notes', 'Test update via script at ' + new Date().toISOString())

    const url = `http://localhost:3001/api/producers/shipments/${id}`
    console.log('Sending PATCH to', url)

    const response = await axios.patch(url, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      timeout: 30000,
    })

    console.log('Response status:', response.status)
    console.log('Response data:', response.data)
  } catch (err) {
    if (err.response) {
      console.error('Response error status:', err.response.status)
      console.error('Response data:', err.response.data)
    } else {
      console.error('Request error:', err.message || err)
    }
  } finally {
    await client.end()
    try { fs.unlinkSync('./scripts/_dummy.txt') } catch (e){}
  }
}

main()
