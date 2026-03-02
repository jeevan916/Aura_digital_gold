import axios from 'axios';

async function check() {
  try {
    const res = await axios.get('https://app.auragoldelite.com/');
    console.log(res.status, res.data);
  } catch (e) {
    console.log(e.response?.status, e.response?.data);
  }
}
check();
