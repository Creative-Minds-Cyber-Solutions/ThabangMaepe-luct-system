import React from 'react';

function Footer() {
  return (
    <footer className="app-footer">
      <small>
        © {new Date().getFullYear()} LUCT Dashboard. All rights reserved.
      </small>
    </footer>
  );
}

export default Footer;
