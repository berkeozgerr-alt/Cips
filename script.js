// --- VERİ YÖNETİMİ AYARLARI ---
const VOTE_STORAGE_KEY = 'chipVotes';
const LAST_VOTE_TIME_KEY = 'lastVoteTime';
const VOTE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Gün milisaniye cinsinden

// Varsayılan oy sayıları (ilk kez yüklendiğinde kullanılacak)
const initialVotes = {
    "Doritos": 0,
    "Pringles": 0,
    // Diğer 8 cipsi buraya ekleyin!
    // ÖRNEK: "Ruffles": 0, "Lays": 0, ...
};


// --- İŞLEVLER ---

/** Yerel depolamadan oyları alır veya varsayılan değerleri döndürür. */
function getVotes() {
    const storedVotes = localStorage.getItem(VOTE_STORAGE_KEY);
    return storedVotes ? JSON.parse(storedVotes) : initialVotes;
}

/** Oyları yerel depolamaya kaydeder. */
function saveVotes(votes) {
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votes));
}

/** Sayfa yüklendiğinde kazananı belirler ve görüntüler. */
function displayWinner() {
    const votes = getVotes();
    const winnerTextElement = document.getElementById('winner-text');
    const now = Date.now();
    
    // Son oylama zamanını al
    const lastVoteTime = parseInt(localStorage.getItem(LAST_VOTE_TIME_KEY) || '0', 10);
    
    // Eğer 30 gün geçtiyse, kazananı ilan et.
    if (now - lastVoteTime >= VOTE_DURATION_MS) {
        
        let maxVotes = -1;
        let winnerChip = null;

        // En çok oyu bul
        for (const chip in votes) {
            if (votes[chip] > maxVotes) {
                maxVotes = votes[chip];
                winnerChip = chip;
            }
        }

        if (winnerChip) {
            // Kazananı göster
            winnerTextElement.innerHTML = `${winnerChip} Kazandı! 🎉`;
            
            // 30 günlük oylama bittiği için zamanı sıfırla (Yeni oylama dönemi başlar)
            localStorage.setItem(LAST_VOTE_TIME_KEY, now.toString()); 
            
            // NOT: Yeni oylama dönemi başladığı için oyları sıfırlamak isteyebilirsiniz.
            // saveVotes(initialVotes); 
        } else {
             // Henüz oy yoksa varsayılan metni gösterir
            winnerTextElement.textContent = "En çok oy verilen cips dağıtılacaktır!";
        }

    } else {
        // 30 gün dolmadıysa varsayılan metni gösterir
        winnerTextElement.textContent = "En çok oy verilen cips dağıtılacaktır!";
    }
}


/** Cipse oy verme işlevi */
function handleVote(event) {
    const clickedCard = event.currentTarget;
    const chipName = clickedCard.dataset.chip;
    
    // Sadece 5 cips için oy kullanmaya izin ver (VOTE_COUNT_LIMIT ile kontrol)
    const VOTE_COUNT_LIMIT = 5;
    const currentVotes = JSON.parse(localStorage.getItem('userVotes') || '[]');
    
    // Kullanıcı zaten buna oy verdiyse oyu geri çek
    if (currentVotes.includes(chipName)) {
        // Oyu geri çekme işlevi (Burada karmaşık olmaması için geri çekme yapmıyoruz, sadece tik işaretini değiştiriyoruz.)
        // Eğer geri çekmeye izin vermek istiyorsanız, bu kısmı geliştirmeniz gerekir.
        return; 
    }
    
    // 5 oy hakkı dolduysa yeni oy vermeyi engelle
    if (currentVotes.length >= VOTE_COUNT_LIMIT) {
        alert("Üzgünüm, en fazla 5 farklı cipse oy verebilirsiniz!");
        return;
    }
    
    // 1. Oy sayısını artır
    const votes = getVotes();
    votes[chipName] = (votes[chipName] || 0) + 1;
    saveVotes(votes);

    // 2. Kullanıcının hangi cipse oy verdiğini kaydet (tik işareti için)
    currentVotes.push(chipName);
    localStorage.setItem('userVotes', JSON.stringify(currentVotes));

    // 3. Tik işaretini göster ve kartı stilize et
    clickedCard.classList.add('voted');
    
    // İlk oylama zamanını kaydet
    if (!localStorage.getItem(LAST_VOTE_TIME_KEY)) {
        localStorage.setItem(LAST_VOTE_TIME_KEY, Date.now().toString());
    }
}


// --- BAŞLANGIÇ ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Kazananı veya varsayılan başlığı görüntüle
    displayWinner();

    // 2. Tüm cips kartlarını dinlemeye başla
    const chipCards = document.querySelectorAll('.chip-card');
    chipCards.forEach(card => {
        card.addEventListener('click', handleVote);
    });
    
    // 3. Kullanıcının daha önce oy verdiği cipslerin tik işaretini göster (Sayfa yenilense bile)
    const currentVotes = JSON.parse(localStorage.getItem('userVotes') || '[]');
    currentVotes.forEach(chipName => {
        const votedCard = document.getElementById(`chip-${chipName}`);
        if (votedCard) {
            votedCard.classList.add('voted');
        }
    });
});
