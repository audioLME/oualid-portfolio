export default async function handler(req, res) {
  try {
    const token = process.env.VERCEL_TOKEN;
    const userId = 'pKyUvmoxBGJbvsBK1Vmc57uR';
    const projectId = 'prj_LgmzCBN6ozGtBH5oB3npJtctybES';

    const response = await fetch(
      `https://api.vercel.com/v6/deployments?teamId=${userId}&projectId=${projectId}&state=READY`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    const deploymentCount = data.deployments?.length || 0;

    // Calculate version: v0.minor.patch (patch always 2 digits)
    const minor = Math.floor(deploymentCount / 100);
    const patch = (deploymentCount % 100).toString().padStart(2, '0');
    const version = `v0.${minor}.${patch}`;

    res.status(200).json({ version, deploymentCount });
  } catch (error) {
    console.error('Deployment fetch error:', error);
    res.status(500).json({ version: 'v0.0.00' });
  }
}
