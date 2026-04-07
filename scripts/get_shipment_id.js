const { Client } = require('pg')
;(async()=>{
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try{
    const r = await client.query('SELECT id FROM shipments LIMIT 1')
    if(r.rows.length===0){
      console.error('NO_ID')
      process.exit(1)
    }
    console.log(r.rows[0].id)
  }catch(e){
    console.error('ERR',e.message||e)
    process.exit(1)
  }finally{ await client.end() }
})()
