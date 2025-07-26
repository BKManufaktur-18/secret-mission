document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const totalPages = document.querySelectorAll('.page').length;
    let currentPage = 1;
    let audioPlaying = false;
    const bgMusic = document.getElementById('bgMusic');
    const clickSound = document.getElementById('clickSound');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const startButton = document.getElementById('startButton');
    
    // Debug logging untuk pastikan tombol ditemukan
    console.log("Start Button:", document.getElementById('startButton'));
    console.log("goToGame Button:", document.getElementById('goToGame'));
    
    // Update navigation display
    document.querySelector('.total-pages').textContent = totalPages;
    
    // Audio control
    const toggleAudioButton = document.getElementById('toggleAudio');
    toggleAudioButton.addEventListener('click', function() {
        if (audioPlaying) {
            bgMusic.pause();
            toggleAudioButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            bgMusic.play().catch(e => console.log("Audio autoplay prevented:", e));
            toggleAudioButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        audioPlaying = !audioPlaying;
    });

    // Deteksi ukuran layar untuk penyesuaian game
    function isMobileDevice() {
        return (window.innerWidth <= 768);
    }
    
    // Simple function to play click sound
    function playClickSound() {
        if (audioPlaying) {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("Audio play prevented:", e));
        }
    }
    
    // Functions to handle page navigation
    function goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        
        console.log("Navigating to page:", pageNumber);
        playClickSound();
        
        // Remove active class from current active page
        document.querySelector('.page.active').classList.remove('active');
        
        // Add active class to target page
        const targetPage = document.getElementById(`page${pageNumber}`);
        targetPage.classList.add('active');
        
        currentPage = pageNumber;
        document.querySelector('.current-page').textContent = currentPage;
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
        
        // Update navigation buttons
        updateNavButtons();
        
        // Handle special cases when entering specific pages
        if (pageNumber === 1) {
            // Reset page 1 if needed
            resetConfetti();
        } else if (pageNumber === 4) {
            // Reset treasure chest
            const chest = document.querySelector('.treasure-chest');
            chest.classList.remove('chest-open');
            document.getElementById('birthday-card').classList.add('hidden');
        } else if (pageNumber === 5) {
            // Reset typewriter
            document.getElementById('typewriter-text').innerHTML = '';
            document.querySelector('.final-message').classList.add('hidden');
        }
    }
    
    function updateNavButtons() {
        prevButton.style.visibility = currentPage === 1 ? 'hidden' : 'visible';
        nextButton.style.visibility = currentPage === totalPages ? 'hidden' : 'visible';
    }
    
    // Initial setup
    updateNavButtons();
    
    // Navigation event listeners
    prevButton.addEventListener('click', function() {
        goToPage(currentPage - 1);
    });
    
    nextButton.addEventListener('click', function() {
        goToPage(currentPage + 1);
    });
    
    // Function untuk mengatur tinggi halaman secara dinamis
    function adjustPageHeight() {
        const gameScreen = document.querySelector('.game-screen');
        const windowHeight = window.innerHeight;
        const activePage = document.querySelector('.page.active');
        
        // Sesuaikan tinggi minimum game screen
        gameScreen.style.minHeight = (windowHeight * 0.7) + 'px';
        
        // Pastikan halaman aktif punya tinggi minimum yang cukup
        if (activePage) {
            const contentHeight = activePage.scrollHeight;
            if (contentHeight > gameScreen.clientHeight) {
                gameScreen.style.height = 'auto';
            }
        }
    }
    
    // Panggil adjustPageHeight saat halaman dimuat dan saat resize
    window.addEventListener('load', adjustPageHeight);
    window.addEventListener('resize', adjustPageHeight);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.code === 'ArrowLeft') {
            goToPage(currentPage - 1);
        } else if (e.code === 'ArrowRight') {
            goToPage(currentPage + 1);
        } else if (e.code === 'Space') {
            // Trigger the main action button on current page
            const activePage = document.querySelector('.page.active');
            const mainButton = activePage.querySelector('.pixel-btn') || 
                              activePage.querySelector('.press-start');
            if (mainButton) {
                mainButton.click();
            }
        }
    });

    // Variabel untuk touch events
    // Variabel untuk touch events
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isScrolling = false;

    function handleSwipe() {
        // Threshold untuk mendeteksi swipe (dalam pixel)
        const swipeThreshold = 50;
        const verticalThreshold = 30;
        
        // Hitung jarak horizontal dan vertikal
        const horizontalDistance = Math.abs(touchEndX - touchStartX);
        const verticalDistance = Math.abs(touchEndY - touchStartY);
        
        // Jika gerakan lebih vertikal daripada horizontal, atau sedang scrolling, jangan trigger swipe
        if (verticalDistance > horizontalDistance || isScrolling || verticalDistance > verticalThreshold) {
            return;
        }
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left, go to next page
            goToPage(currentPage + 1);
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right, go to previous page
            goToPage(currentPage - 1);
        }
    }

    document.addEventListener('touchstart', e => {
        // Jangan handle swipe jika user menyentuh elemen yang bisa di-scroll atau interaktif
        const target = e.target;
        const scrollableElements = ['TEXTAREA', 'INPUT', 'SELECT'];
        const interactiveClasses = ['memory-card', 'advice-card', 'card-nav-btn', 'star', 'pixel-btn'];
        
        // Skip swipe detection jika menyentuh elemen interaktif
        if (scrollableElements.includes(target.tagName) || 
            interactiveClasses.some(cls => target.classList.contains(cls)) ||
            target.closest('.advice-cards-wrapper') ||
            target.closest('.feedback-form') ||
            target.closest('.memory-game-container')) {
            return;
        }
        
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isScrolling = false;
    });
    
    document.addEventListener('touchmove', e => {
        if (!touchStartX || !touchStartY) return;
        
        const currentX = e.changedTouches[0].screenX;
        const currentY = e.changedTouches[0].screenY;
        
        const verticalDistance = Math.abs(currentY - touchStartY);
        const horizontalDistance = Math.abs(currentX - touchStartX);
        
        // Jika gerakan lebih vertikal, anggap sebagai scrolling
        if (verticalDistance > horizontalDistance && verticalDistance > 10) {
            isScrolling = true;
        }
    });
    
    document.addEventListener('touchend', e => {
        if (!touchStartX || !touchStartY) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        // Delay sedikit untuk memastikan scrolling selesai
        setTimeout(() => {
            handleSwipe();
            // Reset values
            touchStartX = 0;
            touchStartY = 0;
            touchEndX = 0;
            touchEndY = 0;
            isScrolling = false;
        }, 50);
    });

    window.addEventListener('resize', function() {
        // Reinitialize game if it's currently visible
        if (!memoryGame.classList.contains('hidden')) {
            initializeMemoryGame();
        }
    });
    
    // Page-specific button navigation
    if (startButton) {
        startButton.addEventListener('click', function() {
            console.log("Start button clicked");
            playClickSound();
            goToPage(2);
            createConfetti();
        });
    } else {
        console.error("Start button not found!");
    }
    
    const goToGameButton = document.getElementById('goToGame');
    if (goToGameButton) {
        goToGameButton.addEventListener('click', function() {
            console.log("Go to game button clicked");
            playClickSound();
            goToPage(3);
        });
    } else {
        console.error("Go to game button not found!");
    }
    
    const goToTreasureButton = document.getElementById('goToTreasure');
    if (goToTreasureButton) {
        goToTreasureButton.addEventListener('click', function() {
            console.log("Go to treasure button clicked");
            playClickSound();
            goToPage(4);
        });
    }
    
    const goToLetterButton = document.getElementById('goToLetter');
    if (goToLetterButton) {
        goToLetterButton.addEventListener('click', function() {
            console.log("Go to letter button clicked");
            playClickSound();
            goToPage(5);
        });
    }
    
    // Memory Game Logic
    const startGameButton = document.getElementById('startGame');
    const memoryGame = document.getElementById('memory-game');
    const gameInstructions = document.querySelector('.game-instructions');
    const gameStats = document.querySelector('.game-stats');
    const gameComplete = document.querySelector('.game-complete');
    const movesDisplay = document.getElementById('moves-count');
    const matchesDisplay = document.getElementById('matches-count');
    
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matches = 0;
    const totalPairs = 6;
    
    // Card content for the memory game
    const cardItems = [
        { image: 'assets/1.jpg', label: 'Image 1' },
        { image: 'assets/2.jpg', label: 'Image 2' },
        { image: 'assets/3.jpg', label: 'Image 3' },
        { image: 'assets/4.jpg', label: 'Image 4' },
        { image: 'assets/5.jpg', label: 'Image 5' },
        { image: 'assets/6.jpg', label: 'Image 6' }
    ];
    
    // Start game button event
    startGameButton.addEventListener('click', function() {
        playClickSound();
        startGameButton.classList.add('hidden');
        gameInstructions.classList.add('hidden');
        
        // Show loading indicator
        document.getElementById('game-loading').classList.remove('hidden');
        
        // Simulate loading (can be removed if loading is quick)
        setTimeout(() => {
            document.getElementById('game-loading').classList.add('hidden');
            memoryGame.classList.remove('hidden');
            gameStats.classList.remove('hidden');
            initializeMemoryGame();
        }, 1000); // Show loading for 1 second
    });
        // Function untuk mengatur tinggi halaman secara dinamis
    function adjustPageHeight() {
        const gameScreen = document.querySelector('.game-screen');
        const windowHeight = window.innerHeight;
        
        // Sesuaikan tinggi minimum game screen
        gameScreen.style.minHeight = (windowHeight * 0.7) + 'px';
    }

    // Panggil adjustPageHeight saat halaman dimuat dan saat resize
    window.addEventListener('load', adjustPageHeight);
    window.addEventListener('resize', adjustPageHeight);

    
    // Modifikasi fungsi initializeMemoryGame untuk menyesuaikan layout berdasarkan ukuran layar
    function initializeMemoryGame() {
        // Clear previous game state
        memoryGame.innerHTML = '';
        moves = 0;
        matches = 0;
        movesDisplay.textContent = moves;
        matchesDisplay.textContent = matches;
        
        // Hide game complete section if it's visible
        gameComplete.classList.add('hidden');
        
        // Adjust grid based on screen size
        if (isMobileDevice()) {
            memoryGame.style.gridTemplateColumns = "repeat(3, 1fr)";
            
            if (window.innerWidth <= 480) {
                memoryGame.style.gridTemplateColumns = "repeat(2, 1fr)";
            }
        } else {
            memoryGame.style.gridTemplateColumns = "repeat(4, 1fr)";
        }
        
        // Create pair of cards (12 cards total)
        const cardPairs = [...cardItems, ...cardItems];
        
        // Shuffle the cards
        cardPairs.sort(() => Math.random() - 0.5);
        
        // Create and append card elements
        cardPairs.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.value = item.image;
            
            // Create front (hidden) side
            const front = document.createElement('div');
            front.classList.add('front');
            front.textContent = '?';
            
            // Create back (revealed) side
            const back = document.createElement('div');
            back.classList.add('back');
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.label;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            back.appendChild(img);
            
            // Append sides to card
            card.appendChild(front);
            card.appendChild(back);
            
            // Add click event
            card.addEventListener('click', flipCard);
            
            // Add to game
            memoryGame.appendChild(card);
        });
    }
    
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        
        playClickSound();
        this.classList.add('flipped');
        
        if (!hasFlippedCard) {
            // First card flipped
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Second card flipped
        secondCard = this;
        hasFlippedCard = false;
        
        // Increment moves counter
        moves++;
        movesDisplay.textContent = moves;
        
        checkForMatch();
    }
    
    function checkForMatch() {
        const isMatch = firstCard.dataset.value === secondCard.dataset.value;
        
        if (isMatch) {
            // It's a match!
            disableCards();
            matches++;
            matchesDisplay.textContent = matches;
            
            // Check if all pairs are matched
            if (matches === totalPairs) {
                setTimeout(() => {
                    showGameComplete();
                }, 1000);
            }
        } else {
            // Not a match, flip cards back
            unflipCards();
        }
    }
    
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        resetBoard();
    }
    
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            resetBoard();
        }, 1000);
    }
    
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    function showGameComplete() {
        // Remove hidden class
        gameComplete.classList.remove('hidden');
        
        // Move gameComplete above the memory game
        const page3 = document.getElementById('page3');
        const memoryGameContainer = document.getElementById('memory-game');
        
        // Insert gameComplete before memoryGame in the DOM
        page3.insertBefore(gameComplete, memoryGameContainer);
        
        // Create confetti effect
        createConfetti();
        
        // Scroll to show the completion message
        gameComplete.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Treasure Chest Animation
    const treasureChest = document.querySelector('.treasure-chest');
    const birthdayCard = document.getElementById('birthday-card');
    
    treasureChest.addEventListener('click', function() {
        playClickSound();
        this.classList.add('chest-open');
        
        setTimeout(() => {
            birthdayCard.classList.remove('hidden');
            birthdayCard.style.animation = 'glow 2s infinite';
            
            // Pastikan kartu berada di tengah dan scroll ke sana
            birthdayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            createConfetti();
        }, 1000);
    });
    
    // Letter Animation
    const readLetterButton = document.getElementById('readLetter');
    const letterContent = document.getElementById('typewriter-text');
    const finalMessage = document.querySelector('.final-message');
    
    // Letter content
    const letterText = [
        "to panes,",
        "",
        "hepibedey ke 20 wok 🎮",
        "",
        "Moga moga di umur iki yaa lebih bahagia lah, lancar lancar segala urusan dan apapun yang direncanakan.",
        "",
        "Wish this year will be your best year. aamiiiin",
        "",
        "Ditunggu TRAKTIRAN nya ya wokk wkwkwkw",
        "",
    ];
    
    readLetterButton.addEventListener('click', function() {
        playClickSound();
        readLetterButton.disabled = true;
        letterContent.innerHTML = '';
        
        let line = 0;
        let char = 0;
        
        function typeWriter() {
            if (line < letterText.length) {
                if (letterText[line] === "") {
                    // Empty line, add paragraph break
                    letterContent.innerHTML += "<p></p>";
                    line++;
                    setTimeout(typeWriter, 200); // Slightly longer pause for paragraph break
                } else if (char < letterText[line].length) {
                    // Still typing current line
                    if (char === 0) {
                        letterContent.innerHTML += "<p>";
                    }
                    
                    letterContent.lastElementChild.innerHTML += letterText[line].charAt(char);
                    char++;
                    setTimeout(typeWriter, 50); // Typing speed
                } else {
                    // End of line
                    letterContent.lastElementChild.innerHTML += "</p>";
                    line++;
                    char = 0;
                    setTimeout(typeWriter, 100); // Pause between lines
                }
            } else {
                // Finished typing
                readLetterButton.disabled = false;
                setTimeout(() => {
                    finalMessage.classList.remove('hidden');
                    createConfetti();
                }, 1000);
            }
        }
        
        // Start typing animation
        typeWriter();
    });
    
    // Confetti Animation
    function createConfetti() {
        const confettiContainer = document.querySelector('.confetti-container');
        confettiContainer.innerHTML = '';
        
        const colors = ['#ffcc00', '#33bbff', '#ff3366', '#33cc66', '#cc66ff'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            
            // Random properties
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100 + '%';
            const size = Math.random() * 8 + 4 + 'px';
            const duration = Math.random() * 2 + 2 + 's';
            const delay = Math.random() * 2 + 's';
            
            // Apply styles
            confetti.style.backgroundColor = color;
            confetti.style.left = left;
            confetti.style.width = size;
            confetti.style.height = size;
            confetti.style.animationDuration = duration;
            confetti.style.animationDelay = delay;
            
            confettiContainer.appendChild(confetti);
        }
        
        // Auto-cleanup after animation completes
        setTimeout(resetConfetti, 5000);
    }
    
    function resetConfetti() {
        const confettiContainer = document.querySelector('.confetti-container');
        confettiContainer.innerHTML = '';
    }
    
    // Advice Cards Logic (Page 6)
    let currentCardIndex = 1;
    const totalCards = 5;
    
    function initializeAdviceCards() {
        const prevCardBtn = document.getElementById('prevCard');
        const nextCardBtn = document.getElementById('nextCard');
        const indicators = document.querySelectorAll('.indicator');
        const goToAdviceBtn = document.getElementById('goToAdvice');
        const goToFeedbackBtn = document.getElementById('goToFeedback');
        
        // Go to advice button from page 5
        if (goToAdviceBtn) {
            goToAdviceBtn.addEventListener('click', function() {
                playClickSound();
                goToPage(6);
            });
        }
        
        // Go to feedback button from page 6
        if (goToFeedbackBtn) {
            goToFeedbackBtn.addEventListener('click', function() {
                playClickSound();
                goToPage(7);
            });
        }
        
        // Previous card button
        if (prevCardBtn) {
            prevCardBtn.addEventListener('click', function() {
                if (currentCardIndex > 1) {
                    playClickSound();
                    showCard(currentCardIndex - 1);
                }
            });
        }
        
        // Next card button
        if (nextCardBtn) {
            nextCardBtn.addEventListener('click', function() {
                if (currentCardIndex < totalCards) {
                    playClickSound();
                    showCard(currentCardIndex + 1);
                }
            });
        }
        
        // Indicator clicks
        indicators.forEach(indicator => {
            indicator.addEventListener('click', function() {
                const cardNumber = parseInt(this.dataset.card);
                if (cardNumber !== currentCardIndex) {
                    playClickSound();
                    showCard(cardNumber);
                }
            });
        });
        
        // Auto-slide functionality
        let autoSlideInterval;
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                const nextIndex = currentCardIndex < totalCards ? currentCardIndex + 1 : 1;
                showCard(nextIndex);
            }, 4000); // Change card every 4 seconds
        }
        
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
        }
        
        // Start auto-slide when page 6 is active
        const page6 = document.getElementById('page6');
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (page6.classList.contains('active')) {
                        startAutoSlide();
                    } else {
                        stopAutoSlide();
                    }
                }
            });
        });
        
        observer.observe(page6, { attributes: true });
        
        // Stop auto-slide on user interaction
        const cardWrapper = document.querySelector('.advice-cards-wrapper');
        if (cardWrapper) {
            cardWrapper.addEventListener('mouseenter', stopAutoSlide);
            cardWrapper.addEventListener('mouseleave', startAutoSlide);
            cardWrapper.addEventListener('touchstart', stopAutoSlide);
            
            // Touch swipe support for cards
           // Touch swipe support for cards
            // Touch swipe support for cards
            let cardTouchStartX = 0;
            let cardTouchEndX = 0;
            let isCardScrolling = false;
            
            cardWrapper.addEventListener('touchstart', function(e) {
                cardTouchStartX = e.changedTouches[0].screenX;
                isCardScrolling = false;
                stopAutoSlide();
            });
            
            cardWrapper.addEventListener('touchmove', function(e) {
                const currentX = e.changedTouches[0].screenX;
                const distance = Math.abs(currentX - cardTouchStartX);
                
                // Jika gerakan horizontal cukup besar, anggap sebagai card swipe
                if (distance > 10) {
                    isCardScrolling = true;
                    e.preventDefault(); // Prevent scrolling when swiping cards
                }
            });
            
            cardWrapper.addEventListener('touchend', function(e) {
                if (!isCardScrolling) {
                    // Restart auto-slide after a delay if no card swipe detected
                    setTimeout(startAutoSlide, 2000);
                    return;
                }
                
                cardTouchEndX = e.changedTouches[0].screenX;
                handleCardSwipe();
                // Restart auto-slide after a delay
                setTimeout(startAutoSlide, 2000);
            });
            
            function handleCardSwipe() {
                const swipeThreshold = 50;
                
                if (cardTouchEndX < cardTouchStartX - swipeThreshold) {
                    // Swipe left, go to next card
                    if (currentCardIndex < totalCards) {
                        showCard(currentCardIndex + 1);
                    }
                }
                
                if (cardTouchEndX > cardTouchStartX + swipeThreshold) {
                    // Swipe right, go to previous card
                    if (currentCardIndex > 1) {
                        showCard(currentCardIndex - 1);
                    }
                }
            }
        }
    }
    
    function showCard(cardIndex) {
        // Remove active class from current card and indicator
        document.querySelector('.advice-card.active').classList.remove('active');
        document.querySelector('.indicator.active').classList.remove('active');
        
        // Add active class to new card and indicator
        document.querySelector(`[data-card="${cardIndex}"]`).classList.add('active');
        document.querySelector(`.indicator[data-card="${cardIndex}"]`).classList.add('active');
        
        currentCardIndex = cardIndex;
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prevCard');
        const nextBtn = document.getElementById('nextCard');
        
        if (prevBtn) prevBtn.disabled = (cardIndex === 1);
        if (nextBtn) nextBtn.disabled = (cardIndex === totalCards);
    }
    
    // Feedback Form Logic (Page 7)
    function initializeFeedbackForm() {
        const feedbackForm = document.getElementById('feedbackForm');
        const stars = document.querySelectorAll('.star');
        const ratingInput = document.getElementById('rating');
        const feedbackSuccess = document.getElementById('feedbackSuccess');
        const backToStartBtn = document.getElementById('backToStart');
        
        // Star rating functionality
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                playClickSound();
                const rating = index + 1;
                ratingInput.value = rating;
                
                // Update star display
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = index + 1;
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.style.filter = 'grayscale(0%)';
                        s.style.transform = 'scale(1.2)';
                    } else {
                        s.style.filter = 'grayscale(100%)';
                        s.style.transform = 'scale(1)';
                    }
                });
            });
        });
        
        // Reset stars on mouse leave
        const ratingContainer = document.querySelector('.rating-container');
        if (ratingContainer) {
            ratingContainer.addEventListener('mouseleave', function() {
                const currentRating = parseInt(ratingInput.value);
                stars.forEach((s, i) => {
                    if (i < currentRating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        }
        
        // Form submission
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', function(e) {
                e.preventDefault();
                playClickSound();
                
                // Get form data
                const formData = new FormData(feedbackForm);
                const feedbackData = {
                    message: formData.get('feedbackMessage'),
                    rating: formData.get('rating'),
                    timestamp: new Date().toLocaleString('id-ID')
                };
                
                // Send to Formspree
                fetch('https://formspree.io/f/xdkdgplg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: 'Pengunjung Birthday Game',
                        email: 'feedback@birthday-game.com', // email placeholder
                        message: feedbackData.message,
                        rating: `${feedbackData.rating}/5 stars`,
                        timestamp: feedbackData.timestamp,
                        source: 'Vanesya Birthday Game'
                    })
                })
                .then(response => {
                    if (response.ok) {
                        // Show success message
                        feedbackForm.classList.add('hidden');
                        feedbackSuccess.classList.remove('hidden');
                        createConfetti();
                    } else {
                        alert('Maaf, terjadi kesalahan. Coba lagi nanti.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Maaf, terjadi kesalahan. Coba lagi nanti.');
                });
            });
        }
        
        // Back to start button
        if (backToStartBtn) {
            backToStartBtn.addEventListener('click', function() {
                playClickSound();
                goToPage(1);
                
                // Reset form
                feedbackForm.reset();
                feedbackForm.classList.remove('hidden');
                feedbackSuccess.classList.add('hidden');
                
                // Reset stars
                stars.forEach(star => star.classList.remove('active'));
                // Set default 5-star rating
                for (let i = 0; i < 5; i++) {
                    stars[i].classList.add('active');
                }
                ratingInput.value = '5';
            });
        }
    }
    
    // Handle initial audio loading
    document.addEventListener('click', function initialClick() {
        bgMusic.volume = 0.3; // Set a comfortable volume level
        bgMusic.play().then(() => {
            audioPlaying = true;
            toggleAudioButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        }).catch(e => {
            console.log("Audio play prevented:", e);
        });
        document.removeEventListener('click', initialClick);
    }, { once: true });

    setTimeout(function() {
        adjustPageHeight();
        
        // Initialize new features
        initializeAdviceCards();
        initializeFeedbackForm();
        
        // Periksa kembali semua button penting
        const buttons = [
            { id: 'startButton', handler: function() { goToPage(2); createConfetti(); } },
            { id: 'goToGame', handler: function() { goToPage(3); } },
            { id: 'goToTreasure', handler: function() { goToPage(4); } },
            { id: 'goToLetter', handler: function() { goToPage(5); } }
        ];
        
        buttons.forEach(function(btn) {
            const element = document.getElementById(btn.id);
            if (element) {
                // Remove existing listeners to prevent duplicates
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                
                // Add new listener
                newElement.addEventListener('click', function(e) {
                    console.log(btn.id + " clicked");
                    playClickSound();
                    btn.handler();
                    e.stopPropagation();
                });
            }
        });
        
        // Initialize final question functionality
        initializeFinalQuestion();
    }, 500);
    
    // Final Question Functionality
    function initializeFinalQuestion() {
        const goToFinalQuestionButton = document.getElementById('goToFinalQuestion');
        const yesButton = document.getElementById('yesButton');
        const noButton = document.getElementById('noButton');
        const finalAnswer = document.getElementById('finalAnswer');
        const backToStartButton = document.getElementById('backToStart');
        
        // Navigation to final question
        if (goToFinalQuestionButton) {
            goToFinalQuestionButton.addEventListener('click', function() {
                playClickSound();
                goToPage(8);
            });
        }
        
        // Yes button handler
        if (yesButton) {
            yesButton.addEventListener('click', function() {
                playClickSound();
                
                // Hide buttons
                document.querySelector('.answer-buttons').style.display = 'none';
                
                // Show final answer
                finalAnswer.classList.remove('hidden');
                
                // Create confetti effect
                createConfetti();
                
                // Scroll to final answer
                finalAnswer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
        
        // No button handler with moving animation
        if (noButton) {
            let clickCount = 0;
            
            noButton.addEventListener('click', function(e) {
                e.preventDefault();
                playClickSound();
                clickCount++;
                
                // Add disappearing animation
                noButton.classList.add('disappearing');
                
                setTimeout(() => {
                    // Move button to random position
                    moveButtonToRandomPosition();
                    
                    // Remove disappearing class and add reappearing
                    noButton.classList.remove('disappearing');
                    noButton.classList.add('reappearing');
                    
                    setTimeout(() => {
                        noButton.classList.remove('reappearing');
                    }, 300);
                }, 300);
            });
            
            function moveButtonToRandomPosition() {
                const container = document.querySelector('.answer-buttons');
                const containerRect = container.getBoundingClientRect();
                const buttonRect = noButton.getBoundingClientRect();
                
                // Calculate safe boundaries (keeping button within container)
                const maxX = containerRect.width - buttonRect.width - 20;
                const maxY = containerRect.height - buttonRect.height - 20;
                
                // Generate random position
                const randomX = Math.random() * maxX;
                const randomY = Math.random() * maxY;
                
                // Apply new position
                noButton.style.left = randomX + 'px';
                noButton.style.top = randomY + 'px';
                noButton.style.right = 'auto';
                noButton.style.bottom = 'auto';
                
                // Add moving class for smooth transition
                noButton.classList.add('moving');
                
                setTimeout(() => {
                    noButton.classList.remove('moving');
                }, 500);
            }
        }
        
        // Back to start button
        if (backToStartButton) {
            backToStartButton.addEventListener('click', function() {
                playClickSound();
                goToPage(1);
                
                // Reset final question state
                document.querySelector('.answer-buttons').style.display = 'flex';
                finalAnswer.classList.add('hidden');
                
                // Reset no button position
                if (noButton) {
                    noButton.style.right = '20px';
                    noButton.style.bottom = '20px';
                    noButton.style.left = 'auto';
                    noButton.style.top = 'auto';
                }
            });
        }
    }
});