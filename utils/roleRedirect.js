

function getDashboardRouteForRole(role) {
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'client':
        return '/dashboard/client';
      case 'professionel':
        return '/dashboard/pro'; 
      default:
        return '/login';
    }
  }
  
  module.exports = { getDashboardRouteForRole };
  