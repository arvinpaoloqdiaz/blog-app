import { useEffect } from 'react';

const copyIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const checkIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

export default function useCodeCopyButtons(dependency) {
  useEffect(() => {
    const applyButtons = () => {
      const preElements = document.querySelectorAll('.post-container pre');
      
      preElements.forEach((pre) => {
        if (pre.querySelector('.copy-btn')) return;

        if (window.getComputedStyle(pre).position === 'static') {
          pre.style.position = 'relative';
        }

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.innerHTML = copyIcon;
        btn.title = "Copy to clipboard";
        
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();

          const codeBlock = pre.querySelector('code');
          const code = codeBlock ? codeBlock.textContent : pre.textContent;
          
          navigator.clipboard.writeText(code);
          btn.innerHTML = checkIcon;
          btn.style.background = 'rgba(255, 255, 255, 0.2)';
          
          setTimeout(() => {
            btn.innerHTML = copyIcon;
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
          }, 2000);
        };

        pre.appendChild(btn);
      });
    };

    // Apply immediately
    applyButtons();

    // Set up a MutationObserver to watch for changes in .post-container
    const observer = new MutationObserver(() => {
      applyButtons();
    });

    const container = document.querySelector('.post-container');
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    } else {
      // If container isn't found right away, observe body
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [dependency]);
}
