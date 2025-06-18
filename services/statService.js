const User = require('../models/User');
const Rdv = require('../models/Rdv');

async function getAdminStats() {
  const totalUsers = await User.countDocuments();
  const totalClients = await User.countDocuments({ role: 'client' });
  const totalProfessionals = await User.countDocuments({ role: 'professionel' });
  const totalAppointments = await Rdv.countDocuments();

  return {
    users: totalUsers,
    clients: totalClients,
    professionals: totalProfessionals,
    rdvs: totalAppointments
  };
}

module.exports = { getAdminStats };
