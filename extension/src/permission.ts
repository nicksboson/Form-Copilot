// extension/src/permission.ts: Helper page to request global microphone permissions for the extension origin

const grantBtn = document.getElementById('grantBtn');
const successMsg = document.getElementById('successMsg');

async function requestMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());

    if (grantBtn) grantBtn.style.display = 'none';
    if (successMsg) successMsg.style.display = 'block';

    setTimeout(() => {
      window.close();
    }, 1800);
  } catch (err: unknown) {
    console.warn('Microphone permission request rejected:', err);
  }
}

grantBtn?.addEventListener('click', requestMic);

// Attempt automatic request on page load
requestMic().catch(() => {});
