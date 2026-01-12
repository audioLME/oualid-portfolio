export default async function handler(req, res) {
  try {
    const token = process.env.VERCEL_TOKEN;
    const userId = 'pKyUvmoxBGJbvsBK1Vmc57uR';
    const projectId = 'prj_LgmzCBN6ozGtBH5oB3npJtctybES';

    const response = await fetch(
      `https://api.vercel.com/v6/deployments?teamId=${userId}&projectId=${projectId}&state=READY&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    const lastDeployment = data.deployments?.[0];
    
    if (lastDeployment) {
      const deployDate = new Date(lastDeployment.createdAt);
      const now = new Date();
      const diffMs = now - deployDate;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeAgo;
      if (diffSecs < 60) timeAgo = `${diffSecs}s ago`;
      else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
      else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
      else timeAgo = `${diffDays}d ago`;
      
      res.status(200).json({ version: timeAgo });
    } else {
      res.status(200).json({ version: 'never' });
    }
  } catch (error) {
    console.error('Deployment fetch error:', error);
    res.status(500).json({ version: 'unknown' });
  }
}
