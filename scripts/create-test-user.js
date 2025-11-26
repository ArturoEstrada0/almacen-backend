/**
 * Script para crear un usuario de prueba en Supabase
 * Uso: node scripts/create-test-user.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  console.log('\n🔧 Creando usuario de prueba...\n');

  const email = 'admin@almacen.com';
  const password = 'admin123456';

  try {
    // Crear usuario con el service role key
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmar el email
      user_metadata: {
        full_name: 'Administrador',
        role: 'admin',
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️  El usuario ya existe. Puedes usar estas credenciales:\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Usuario creado exitosamente!\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ' + email);
    console.log('🔑 Password: ' + password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('👉 Ahora puedes iniciar sesión en: http://localhost:3000/auth/login\n');
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    process.exit(1);
  }
}

createTestUser();
