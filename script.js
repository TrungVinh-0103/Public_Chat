// Enhanced Modern Chat Application
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Supabase
  const supabaseUrl = "https://hcfiwaoooykjtausqllw.supabase.co"
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZml3YW9vb3lranRhdXNxbGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODg2OTgsImV4cCI6MjA3MTk2NDY5OH0.zeTttuusmJEOCMkymPAQLIhxge-0buzRL2S-OnPiWp8"
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

  let currentUser = null
  let isRecording = false
  let mediaRecorder = null
  let recordingChunks = []
  let recordingStartTime = null

  // ========== LOGIN PAGE ==========
  if (document.getElementById("loginForm")) {
    const loginForm = document.getElementById("loginForm")
    const errorMsg = document.getElementById("errorMsg")
    const loginBtn = loginForm.querySelector(".login-btn")
    const btnContent = loginBtn.querySelector(".btn-content")
    const btnLoader = loginBtn.querySelector(".btn-loader")
    const btnSuccess = loginBtn.querySelector(".btn-success")
    const togglePassword = document.getElementById("togglePassword")
    const passwordInput = document.getElementById("password")

    // Enhanced password toggle
    togglePassword?.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)
      togglePassword.innerHTML = type === "password" ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>'
    })

    // Google Login
const googleLoginBtn = document.getElementById("googleLoginBtn")
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/chat.html", // sau khi login xong sẽ chuyển đến chat.html
        },
      })
      if (error) {
        console.error("Google login error:", error)
        showError("Đăng nhập Google thất bại!")
      } else {
        console.log("Redirecting to Google login...")
      }
    } catch (err) {
      console.error("Unexpected Google login error:", err)
      showError("Có lỗi xảy ra khi đăng nhập Google!")
    }
  })
}


    // Enhanced form validation and submission
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value.trim()
      const password = document.getElementById("password").value.trim()

      if (!email || !password) {
        showError("Vui lòng nhập đầy đủ thông tin!")
        return
      }

      if (!isValidEmail(email)) {
        showError("Email không hợp lệ!")
        return
      }

      // Show loading state
      setLoginButtonState("loading")
      clearError()

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          showError(`Đăng nhập thất bại: ${error.message}`)
          setLoginButtonState("default")
          return
        }

        currentUser = data.user
        console.log("Login successful:", currentUser.email)

        // Show success state
        setLoginButtonState("success")

        // Redirect after animation
        setTimeout(() => {
          window.location.href = "chat.html"
        }, 1500)
      } catch (err) {
        console.error("Login error:", err)
        showError("Có lỗi xảy ra, vui lòng thử lại!")
        setLoginButtonState("default")
      }
    })

    function setLoginButtonState(state) {
      loginBtn.classList.remove("loading", "success")

      switch (state) {
        case "loading":
          loginBtn.classList.add("loading")
          break
        case "success":
          loginBtn.classList.add("success")
          loginBtn.style.background = "linear-gradient(135deg, #4ecdc4, #44a08d)"
          break
        case "default":
          loginBtn.style.background = ""
          break
      }
    }

    function showError(message) {
      errorMsg.textContent = message
      errorMsg.style.opacity = "1"
      errorMsg.style.transform = "translateY(0)"
    }

    function clearError() {
      errorMsg.style.opacity = "0"
      errorMsg.style.transform = "translateY(-10px)"
      setTimeout(() => {
        errorMsg.textContent = ""
      }, 300)
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // Enhanced input animations
    const inputs = document.querySelectorAll(".form-input")
    inputs.forEach((input) => {
      input.addEventListener("focus", function () {
        this.parentElement.querySelector(".input-icon").style.color = "var(--text-primary)"
      })

      input.addEventListener("blur", function () {
        this.parentElement.querySelector(".input-icon").style.color = "var(--text-muted)"
      })

      // Auto-resize for better UX
      input.addEventListener("input", function () {
        if (this.value) {
          this.parentElement.classList.add("has-value")
        } else {
          this.parentElement.classList.remove("has-value")
        }
      })
    })
  }

  // ========== CHAT PAGE ==========
  if (document.getElementById("chatBox")) {
    const chatBox = document.getElementById("chatBox")
    const messageInput = document.getElementById("messageInput")
    const sendBtn = document.getElementById("sendBtn")
    const logoutBtn = document.getElementById("logoutBtn")
    const recordBtn = document.getElementById("recordBtn")
    const stopRecordBtn = document.getElementById("stopRecordBtn")
    const fileInput = document.getElementById("fileInput")
    const attachBtn = document.getElementById("attachBtn")
    const emojiBtn = document.getElementById("emojiBtn")
    const emojiPicker = document.getElementById("emojiPicker")
    const emojiGrid = document.getElementById("emojiGrid")
    const closeEmoji = document.getElementById("closeEmoji")
    const scrollToBottom = document.getElementById("scrollToBottom")
    const mobileMenuBtn = document.getElementById("mobileMenuBtn")
    const chatSidebar = document.getElementById("chatSidebar")
    const mobileOverlay = document.getElementById("mobileOverlay")
    const mediaPreview = document.getElementById("mediaPreview")
    const voicePreview = document.getElementById("voicePreview")
    const removeMedia = document.getElementById("removeMedia")
    const removeVoice = document.getElementById("removeVoice")

    let pendingFile = null
    let pendingVoice = null
    let lastScrollTop = 0

    // Enhanced authentication state management
    supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    currentUser = session.user

    const userNameElement = document.getElementById("currentUserName")
    const userAvatar = document.getElementById("currentUserAvatar")

    const displayName = currentUser.user_metadata?.full_name || currentUser.email
    const avatarUrl = currentUser.user_metadata?.avatar_url

    if (userNameElement) {
      userNameElement.textContent = displayName
    }
    if (userAvatar && avatarUrl) {
      userAvatar.src = avatarUrl
    }

    initializeChat()
    updateOnlineStatus(true)
    console.log("User authenticated:", displayName)
  } else {
    window.location.href = "index.html"
  }
})

    // Initialize chat functionality
    function initializeChat() {
      loadInitialMessages()
      setupRealtimeSubscription()
      setupScrollBehavior()
      setupMobileNavigation()
      setupEmojiPicker()
      setupFileHandling()
      setupVoiceRecording()
      setupInputEnhancements()
    }

    // Enhanced message loading
    async function loadInitialMessages() {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .order("timestamp", { ascending: true })
          .limit(50)

        if (error) {
          console.error("Error loading messages:", error)
          return
        }

        data.forEach((msg) => {
          addMessage(msg.username, msg.content, msg.type, msg.timestamp, false)
        })

        scrollToBottomSmooth()
      } catch (err) {
        console.error("Failed to load messages:", err)
      }
    }

    // Enhanced realtime subscription
    function setupRealtimeSubscription() {
      const channel = supabase.channel("messages")
      channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const msg = payload.new
              addMessage(msg.username, msg.content, msg.type, msg.timestamp, true)
            }
          },
        )
        .subscribe()
    }

    // Enhanced message display
    function addMessage(username, content, type = "text", timestamp = new Date().toISOString(), isNew = false) {
      const messageDiv = document.createElement("div")
      messageDiv.classList.add("message", username === currentUser.email ? "self" : "other")

      const bubble = document.createElement("div")
      bubble.classList.add("message-bubble")

      const header = document.createElement("div")
      header.classList.add("message-header")

      const timeFormatted = new Date(timestamp).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })

      header.innerHTML = `
        <strong>${username.split("@")[0]}</strong>
        <span>•</span>
        <span>${timeFormatted}</span>
      `

      const messageContent = document.createElement("div")
      messageContent.classList.add("message-content")

      // Handle different message types
      switch (type) {
        case "text":
          messageContent.textContent = content
          break
        case "image":
          const img = document.createElement("img")
          img.src = content
          img.alt = "Shared image"
          img.onclick = () => openMediaModal(content, "image")
          messageContent.appendChild(img)
          break
        case "video":
          const video = document.createElement("video")
          video.src = content
          video.controls = true
          video.preload = "metadata"
          messageContent.appendChild(video)
          break
        case "voice":
          const voicePlayer = createVoicePlayer(content)
          messageContent.appendChild(voicePlayer)
          break
      }

      bubble.appendChild(header)
      bubble.appendChild(messageContent)
      messageDiv.appendChild(bubble)

      chatBox.appendChild(messageDiv)

      // Enhanced animation for new messages
      if (isNew) {
        messageDiv.style.opacity = "0"
        messageDiv.style.transform = "translateY(20px) scale(0.95)"

        requestAnimationFrame(() => {
          messageDiv.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          messageDiv.style.opacity = "1"
          messageDiv.style.transform = "translateY(0) scale(1)"
        })

        // Auto-scroll for new messages
        setTimeout(() => {
          scrollToBottomSmooth()
        }, 100)
      }
    }

    // Enhanced voice player
    function createVoicePlayer(audioUrl) {
      const player = document.createElement("div")
      player.className = "voice-message-player"

      const playBtn = document.createElement("button")
      playBtn.className = "voice-play-btn"
      playBtn.innerHTML = '<i class="fas fa-play"></i>'

      const progress = document.createElement("div")
      progress.className = "voice-progress"
      const progressBar = document.createElement("div")
      progressBar.className = "voice-progress-bar"
      progress.appendChild(progressBar)

      const timeDisplay = document.createElement("span")
      timeDisplay.className = "voice-time"
      timeDisplay.textContent = "0:00"

      const audio = document.createElement("audio")
      audio.src = audioUrl
      audio.preload = "metadata"

      let isPlaying = false

      playBtn.onclick = () => {
        if (isPlaying) {
          audio.pause()
          playBtn.innerHTML = '<i class="fas fa-play"></i>'
          isPlaying = false
        } else {
          // Pause other playing audio
          document.querySelectorAll("audio").forEach((a) => {
            if (a !== audio) a.pause()
          })

          audio.play()
          playBtn.innerHTML = '<i class="fas fa-pause"></i>'
          isPlaying = true
        }
      }

      audio.ontimeupdate = () => {
        const progress = (audio.currentTime / audio.duration) * 100
        progressBar.style.width = progress + "%"

        const minutes = Math.floor(audio.currentTime / 60)
        const seconds = Math.floor(audio.currentTime % 60)
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
      }

      audio.onended = () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>'
        isPlaying = false
        progressBar.style.width = "0%"
        timeDisplay.textContent = "0:00"
      }

      audio.onloadedmetadata = () => {
        const minutes = Math.floor(audio.duration / 60)
        const seconds = Math.floor(audio.duration % 60)
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
      }

      player.appendChild(playBtn)
      player.appendChild(progress)
      player.appendChild(timeDisplay)
      player.appendChild(audio)

      return player
    }

    // Enhanced message saving
    async function saveMessage(username, content, type) {
      try {
        const { data, error } = await supabase.from("messages").insert([
          {
            username,
            content,
            type,
            timestamp: new Date().toISOString(),
          },
        ])

        if (error) {
          console.error("Save message error:", error)
          showNotification("Không thể gửi tin nhắn", "error")
        }
      } catch (err) {
        console.error("Failed to save message:", err)
        showNotification("Lỗi kết nối", "error")
      }
    }

    // Enhanced scroll behavior
    function setupScrollBehavior() {
      chatBox.addEventListener("scroll", () => {
        const scrollTop = chatBox.scrollTop
        const scrollHeight = chatBox.scrollHeight
        const clientHeight = chatBox.clientHeight

        // Show/hide scroll to bottom button
        if (scrollHeight - scrollTop - clientHeight > 100) {
          scrollToBottom.classList.add("show")
        } else {
          scrollToBottom.classList.remove("show")
        }

        lastScrollTop = scrollTop
      })

      scrollToBottom.addEventListener("click", scrollToBottomSmooth)
    }

    function scrollToBottomSmooth() {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth",
      })
    }

    // Enhanced mobile navigation
    function setupMobileNavigation() {
      mobileMenuBtn?.addEventListener("click", () => {
        chatSidebar.classList.add("open")
        mobileOverlay.classList.add("show")
        document.body.style.overflow = "hidden"
      })

      mobileOverlay?.addEventListener("click", () => {
        chatSidebar.classList.remove("open")
        mobileOverlay.classList.remove("show")
        document.body.style.overflow = ""
      })

      // Close sidebar on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && chatSidebar.classList.contains("open")) {
          chatSidebar.classList.remove("open")
          mobileOverlay.classList.remove("show")
          document.body.style.overflow = ""
        }
      })
    }

    // Enhanced emoji picker
    function setupEmojiPicker() {
      const emojis = [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "🤣",
        "😂",
        "🙂",
        "🙃",
        "😉",
        "😊",
        "😇",
        "🥰",
        "😍",
        "🤩",
        "😘",
        "😗",
        "😚",
        "😙",
        "😋",
        "😛",
        "😜",
        "🤪",
        "😝",
        "🤑",
        "🤗",
        "🤭",
        "🤫",
        "🤔",
        "🤐",
        "🤨",
        "😐",
        "😑",
        "😶",
        "😏",
        "😒",
        "🙄",
        "😬",
        "🤥",
        "😔",
        "😪",
        "🤤",
        "😴",
        "😷",
        "🤒",
        "🤕",
        "🤢",
        "🤮",
        "🤧",
        "🥵",
        "🥶",
        "🥴",
        "😵",
        "🤯",
        "🤠",
        "🥳",
        "😎",
        "🤓",
        "🧐",
        "😕",
        "😟",
        "🙁",
        "☹️",
        "😮",
        "😯",
        "😲",
        "😳",
        "🥺",
        "😦",
        "😧",
        "😨",
        "😰",
        "😥",
        "😢",
        "😭",
        "😱",
        "😖",
        "😣",
        "😞",
        "😓",
        "😩",
        "😫",
        "🥱",
        "😤",
        "😡",
        "😠",
        "🤬",
        "👍",
        "👎",
        "👌",
        "🤌",
        "🤏",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "👇",
        "☝️",
        "👏",
        "🙌",
        "👐",
        "🤲",
        "🤝",
        "🙏",
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "🔥",
        "💫",
        "⭐",
        "🌟",
        "✨",
        "⚡",
        "☄️",
        "💥",
        "🌈",
        "☀️",
        "🌤️",
        "⛅",
        "🌦️",
        "🌧️",
        "⛈️",
        "🌩️",
      ]

      // Populate emoji grid
      emojiGrid.innerHTML = ""
      emojis.forEach((emoji) => {
        const btn = document.createElement("button")
        btn.className = "emoji-btn"
        btn.textContent = emoji
        btn.onclick = (e) => {
          e.stopPropagation()
          insertEmoji(emoji)
        }
        emojiGrid.appendChild(btn)
      })

      // Toggle emoji picker
      emojiBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        toggleEmojiPicker()
      })

      closeEmoji.addEventListener("click", () => {
        hideEmojiPicker()
      })

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
          hideEmojiPicker()
        }
      })
    }

    function toggleEmojiPicker() {
      if (emojiPicker.classList.contains("d-none")) {
        showEmojiPicker()
      } else {
        hideEmojiPicker()
      }
    }

    function showEmojiPicker() {
      emojiPicker.classList.remove("d-none")
      messageInput.focus()
    }

    function hideEmojiPicker() {
      emojiPicker.classList.add("d-none")
    }

    function insertEmoji(emoji) {
      const cursorPos = messageInput.selectionStart
      const textBefore = messageInput.value.substring(0, cursorPos)
      const textAfter = messageInput.value.substring(messageInput.selectionEnd)

      messageInput.value = textBefore + emoji + textAfter
      messageInput.selectionStart = messageInput.selectionEnd = cursorPos + emoji.length
      messageInput.focus()

      // Auto-resize textarea
      autoResizeTextarea()
    }

    // Enhanced file handling
    function setupFileHandling() {
      attachBtn.addEventListener("click", () => {
        fileInput.click()
      })

      fileInput.addEventListener("change", handleFileSelection)
      removeMedia.addEventListener("click", clearMediaPreview)

      // Drag and drop support
      chatBox.addEventListener("dragover", (e) => {
        e.preventDefault()
        chatBox.classList.add("drag-over")
      })

      chatBox.addEventListener("dragleave", () => {
        chatBox.classList.remove("drag-over")
      })

      chatBox.addEventListener("drop", (e) => {
        e.preventDefault()
        chatBox.classList.remove("drag-over")

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
          handleFiles(files)
        }
      })
    }

    function handleFileSelection(e) {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        handleFiles(files)
      }
    }

    function handleFiles(files) {
      const file = files[0] // Handle first file only for now

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        showNotification("File quá lớn! Giới hạn 10MB.", "error")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        showNotification("Chỉ hỗ trợ hình ảnh và video!", "error")
        return
      }

      pendingFile = file
      showMediaPreview(file)
      messageInput.placeholder = "File đã sẵn sàng để gửi..."
    }

    function showMediaPreview(file) {
      const previewMedia = mediaPreview.querySelector(".preview-media")
      previewMedia.innerHTML = ""

      if (file.type.startsWith("image/")) {
        const img = document.createElement("img")
        img.src = URL.createObjectURL(file)
        img.alt = "Preview"
        previewMedia.appendChild(img)
      } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video")
        video.src = URL.createObjectURL(file)
        video.controls = false
        video.muted = true
        previewMedia.appendChild(video)
      }

      mediaPreview.classList.remove("d-none")
    }

    function clearMediaPreview() {
      pendingFile = null
      mediaPreview.classList.add("d-none")
      messageInput.placeholder = "Nhập tin nhắn..."
      fileInput.value = ""
    }

    // Enhanced voice recording
    function setupVoiceRecording() {
      recordBtn.addEventListener("click", startRecording)
      stopRecordBtn.addEventListener("click", stopRecording)
      removeVoice.addEventListener("click", clearVoicePreview)
    }

    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        })

        mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg",
        })

        recordingChunks = []
        recordingStartTime = Date.now()
        isRecording = true

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordingChunks.push(e.data)
          }
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordingChunks, {
            type: mediaRecorder.mimeType,
          })
          pendingVoice = blob
          showVoicePreview()

          // Stop all tracks
          stream.getTracks().forEach((track) => track.stop())
        }

        mediaRecorder.start(100) // Collect data every 100ms

        recordBtn.classList.add("d-none")
        stopRecordBtn.classList.remove("d-none")
        stopRecordBtn.classList.add("recording")

        // Start waveform animation
        startWaveformAnimation()
      } catch (err) {
        console.error("Recording error:", err)
        showNotification("Không thể truy cập microphone!", "error")
      }
    }

    function stopRecording() {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop()
        isRecording = false

        recordBtn.classList.remove("d-none")
        stopRecordBtn.classList.add("d-none")
        stopRecordBtn.classList.remove("recording")

        stopWaveformAnimation()
      }
    }

    function showVoicePreview() {
      const duration = Math.floor((Date.now() - recordingStartTime) / 1000)
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60

      voicePreview.querySelector(".voice-duration").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

      voicePreview.classList.remove("d-none")
      messageInput.placeholder = "Tin nhắn thoại đã sẵn sàng để gửi..."
    }

    function clearVoicePreview() {
      pendingVoice = null
      voicePreview.classList.add("d-none")
      messageInput.placeholder = "Nhập tin nhắn..."
    }

    function startWaveformAnimation() {
      const bars = voicePreview.querySelectorAll(".wave-bar")
      bars.forEach((bar) => {
        bar.style.animationPlayState = "running"
      })
    }

    function stopWaveformAnimation() {
      const bars = voicePreview.querySelectorAll(".wave-bar")
      bars.forEach((bar) => {
        bar.style.animationPlayState = "paused"
      })
    }

    // Enhanced input handling
    function setupInputEnhancements() {
      messageInput.addEventListener("input", autoResizeTextarea)
      messageInput.addEventListener("keydown", handleKeyDown)
      sendBtn.addEventListener("click", sendMessage)
    }

    function autoResizeTextarea() {
      messageInput.style.height = "auto"
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px"
    }

    function handleKeyDown(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    }

    // Enhanced message sending
    async function sendMessage() {
      const text = messageInput.value.trim()

      // Add sending animation
      sendBtn.style.transform = "scale(0.9)"
      setTimeout(() => {
        sendBtn.style.transform = "scale(1)"
      }, 150)

      try {
        if (text) {
          await saveMessage(currentUser.email, text, "text")
          messageInput.value = ""
          autoResizeTextarea()
        } else if (pendingVoice) {
          await uploadAndSendVoice()
        } else if (pendingFile) {
          await uploadAndSendFile()
        }
      } catch (err) {
        console.error("Send message error:", err)
        showNotification("Không thể gửi tin nhắn", "error")
      }
    }

    async function uploadAndSendVoice() {
      const filePath = `voice/${currentUser.id}/${Date.now()}.${pendingVoice.type.split("/")[1]}`

      const { data, error } = await supabase.storage.from("media").upload(filePath, pendingVoice)

      if (error) {
        console.error("Voice upload error:", error)
        showNotification("Không thể tải lên tin nhắn thoại", "error")
        return
      }

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath)

      await saveMessage(currentUser.email, urlData.publicUrl, "voice")
      clearVoicePreview()
    }

    async function uploadAndSendFile() {
      const fileExt = pendingFile.name.split(".").pop()
      const filePath = `files/${currentUser.id}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from("media").upload(filePath, pendingFile)

      if (error) {
        console.error("File upload error:", error)
        showNotification("Không thể tải lên file", "error")
        return
      }

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath)

      const messageType = pendingFile.type.startsWith("image/") ? "image" : "video"
      await saveMessage(currentUser.email, urlData.publicUrl, messageType)
      clearMediaPreview()
    }

    // Enhanced online status
    async function updateOnlineStatus(isOnline) {
      if (currentUser) {
        try {
          await supabase.from("users").upsert({
            id: currentUser.id,
            email: currentUser.email,
            online: isOnline,
            last_seen: isOnline ? null : new Date().toISOString(),
          })
        } catch (err) {
          console.error("Update online status error:", err)
        }
      }
    }

    // Enhanced logout
    logoutBtn?.addEventListener("click", async () => {
      try {
        await updateOnlineStatus(false)
        await supabase.auth.signOut()
        window.location.href = "index.html"
      } catch (err) {
        console.error("Logout error:", err)
        window.location.href = "index.html"
      }
    })

    // Utility functions
    function showNotification(message, type = "info") {
      // Create notification element
      const notification = document.createElement("div")
      notification.className = `notification notification-${type}`
      notification.textContent = message

      // Style the notification
      Object.assign(notification.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "12px 20px",
        borderRadius: "8px",
        color: "white",
        fontWeight: "500",
        zIndex: "9999",
        transform: "translateX(100%)",
        transition: "transform 0.3s ease",
      })

      if (type === "error") {
        notification.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a52)"
      } else {
        notification.style.background = "linear-gradient(135deg, #4ecdc4, #44a08d)"
      }

      document.body.appendChild(notification)

      // Animate in
      setTimeout(() => {
        notification.style.transform = "translateX(0)"
      }, 100)

      // Remove after delay
      setTimeout(() => {
        notification.style.transform = "translateX(100%)"
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 3000)
    }

    function openMediaModal(src, type) {
      // Create modal for full-screen media viewing
      const modal = document.createElement("div")
      modal.className = "media-modal"
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
      `

      const media = document.createElement(type)
      media.src = src
      if (type === "video") {
        media.controls = true
      }
      media.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
      `

      modal.appendChild(media)
      document.body.appendChild(modal)

      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal)
        }
      }
    }

    // Handle page visibility for online status
    document.addEventListener("visibilitychange", () => {
      if (currentUser) {
        updateOnlineStatus(!document.hidden)
      }
    })

    // Handle beforeunload for cleanup
    window.addEventListener("beforeunload", () => {
      if (currentUser) {
        updateOnlineStatus(false)
      }
    })
  }
})
