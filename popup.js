function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "8px 16px";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "9999";
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = "opacity 0.5s ease";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 400);
}

function loadHistory() {
    chrome.storage.local.get("clipboard", (data) => {
        let items = data.clipboard || [];

        // Move pinned items to top
        items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

        const historyDiv = document.getElementById("history");
        historyDiv.innerHTML = "";

        if (items.length <= 0) {
            historyDiv.style.textAlign = "center";
            historyDiv.innerHTML = "Nothing to copy. Copy somthing to show here!";
            document.getElementById("maintitle").style.textAlign = "center";
            document.getElementById("maintitle").style.width = "100%";
            document.getElementById("clear").style.display = "none";
        } else {
            items.forEach((item, index) => {
                const div = document.createElement("div");
                div.className = "clip";
                div.title = "Click to copy";

                const span = document.createElement("span");
                span.textContent = item.text?.slice(0, 100) || "(empty)";

                div.addEventListener("click", () => {
                    const blobMap = {
                        "text/plain": new Blob([item.text || ""], { type: "text/plain" }),
                    };
                    if (item.html) {
                        blobMap["text/html"] = new Blob([item.html], { type: "text/html" });
                    }
                    navigator.clipboard.write([new ClipboardItem(blobMap)]).then(() => {
                        showToast("Copied to clipboard!");
                    });
                });

                const pinBtn = document.createElement("button");
                pinBtn.textContent = item.pinned ? "📌" : "📍";
                pinBtn.title = "Pin/Unpin this entry";
                pinBtn.addEventListener("click", (event) => {
                    event.stopPropagation();
                    items[index].pinned = !items[index].pinned;
                    chrome.storage.local.set({ clipboard: items }, loadHistory);
                });

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "✖️";
                deleteBtn.title = "Delete this entry";
                deleteBtn.addEventListener("click", (event) => {
                    event.stopPropagation();
                    items.splice(index, 1);
                    chrome.storage.local.set({ clipboard: items }, loadHistory);
                });

                div.appendChild(span);
                div.appendChild(pinBtn);
                div.appendChild(deleteBtn);
                historyDiv.appendChild(div);
            });
        }
    });
}

document.getElementById("clear").addEventListener("click", () => {
    chrome.storage.local.get("clipboard", (data) => {
        let items = data.clipboard || [];
        // Keep only pinned items
        const pinnedItems = items.filter((item) => item.pinned);
        chrome.storage.local.set({ clipboard: pinnedItems }, loadHistory);
    });
});

document.addEventListener("DOMContentLoaded", loadHistory);
