// Nomor member yang tercetak di kartu, diturunkan dari members.id (mis. id 7 → CAFU-00007).
exports.memberCode = (id) => `CAFU-${String(id).padStart(5, '0')}`;
