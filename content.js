document.addEventListener("copy", (e) => {
    let text = "";
    let html = "";

    // Try getting copied text from selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const container = document.createElement("div");
        container.appendChild(selection.getRangeAt(0).cloneContents());
        html = container.innerHTML;
        text = selection.toString();
    }

    const item = { text, html };

    chrome.storage.local.get("clipboard", (data) => {
        let items = data.clipboard || [];
        if (text && !items.find((i) => i.text === text)) {
            items.unshift(item);
            if (items.length > 30) items.pop();
            chrome.storage.local.set({ clipboard: items });
        }
    });
});
