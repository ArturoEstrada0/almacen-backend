const https = require('https');

const SUPABASE_URL = 'ehpssgacrncyarzxogmv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocHNzZ2Fjcm5jeWFyenhvZ212Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI3NTY5NCwiZXhwIjoyMDc2ODUxNjk0fQ.w_x6L9Vm1kb91OFz3_8FdxHv88-I47Bo8KuprQ-Uhp0';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Error parsing response: ' + data));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function main() {
  console.log('🔍 Verificando productores existentes...\n');
  
  const producers = await makeRequest('/rest/v1/producers?select=id,code,name&order=code.asc');
  
  console.log('Respuesta:', JSON.stringify(producers, null, 2).substring(0, 500));
  
  if (!Array.isArray(producers)) {
    console.log('Error: La respuesta no es un array');
    return;
  }
  
  console.log('📊 Total de productores:', producers.length);
  console.log('\n📋 Lista de productores:');
  console.log('────────────────────────────────────────────────────────');
  
  producers.forEach(p => {
    console.log(`  Código: ${(p.code || 'N/A').padEnd(10)} | Nombre: ${p.name}`);
  });
  
  // Buscar si hay algo cercano a 3001
  const matching = producers.filter(p => p.code && p.code.includes('3001'));
  if (matching.length > 0) {
    console.log('\n✅ Productores que coinciden con 3001:', matching);
  } else {
    console.log('\n⚠️  No hay productores con código que contenga "3001"');
  }
  
  // Verificar inventario actual en los 3 almacenes
  console.log('\n\n🏭 Verificando inventario actual en los almacenes...\n');
  
  const warehouseIds = [
    '3ecff096-a87c-44f4-a4fd-5b98f7ce2c29', // Manuel Doblado Material de Empaque
    '10c3387f-8db3-4414-a62b-6ef9bf74e60d', // Panindicuario Materia Prima
    'ad928827-3ad0-407a-963c-ed7911371e27'  // Zamora Material de Empaque
  ];
  
  for (const whId of warehouseIds) {
    const inventory = await makeRequest(`/rest/v1/inventory?warehouse_id=eq.${whId}&select=*,product:products(sku,name),warehouse:warehouses(name)`);
    console.log(`\n📦 Almacén: ${inventory[0]?.warehouse?.name || 'ID: ' + whId}`);
    console.log(`   Total items en inventario: ${inventory.length}`);
    
    if (inventory.length > 0) {
      inventory.forEach(item => {
        console.log(`   - ${item.product?.sku}: ${item.quantity} unidades`);
      });
    }
  }
}

main().catch(console.error);
