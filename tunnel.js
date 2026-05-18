import localtunnel from 'localtunnel'; 
(async () => { 
  const tunnel = await localtunnel({ port: 4173 }); 
  console.log('TUNNEL URL: ' + tunnel.url); 
  
  // Keep alive
  setInterval(() => {}, 1000);
})();
