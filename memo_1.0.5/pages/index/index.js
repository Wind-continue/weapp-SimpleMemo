// index.json

Page({
  data: {
    showInput: false,
    newTitle: "",
    newContent: "",
    selectedImages: [], // 存储选中图片的本地路径
    memos: [],
    maxTitleLength: 50,
    maxInputLength: 5000,
    maxImageCount: 9 // 最多上传9张图片
  },

  toggleInput() {
    if (!this.data.showInput) {
      this.setData({ newTitle: "", newContent: "", selectedImages: [] });
    }
    this.setData({ showInput: !this.data.showInput });
  },

  onTitleChange(e) {
    this.setData({ newTitle: e.detail.value });
  },

  onInputChange(e) {
    this.setData({ newContent: e.detail.value });
  },

  chooseImage() {
    const { selectedImages, maxImageCount } = this.data;
    const remainCount = maxImageCount - selectedImages.length;

    if (remainCount <= 0) {
      wx.showToast({ title: `最多只能选择${maxImageCount}张图片`, icon: "none" });
      return;
    }

    wx.chooseImage({
      count: remainCount,
      sizeType: ['original', 'compressed'], // 支持原图和压缩图
      sourceType: ['album', 'camera'], // 支持相册和相机
      success: (res) => {
        // 1. 获取文件系统管理器（替代废弃的wx.saveFile）
        const fs = wx.getFileSystemManager();
        const tempPaths = res.tempFilePaths;
        const savePromises = tempPaths.map(tempPath => {
          return new Promise((resolve, reject) => {
            // 2. 自定义保存路径（确保路径唯一，避免覆盖）
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substr(2, 8);
            const savedFilePath = `${wx.env.USER_DATA_PATH}/memo_img_${timestamp}_${randomStr}.png`;

            // 3. 使用fs.saveFile保存文件（替代wx.saveFile）
            fs.saveFile({
              tempFilePath: tempPath,
              filePath: savedFilePath, // 自定义持久化路径
              success: () => {
                // 返回自定义的持久化路径（确保关闭小程序后可访问）
                resolve(savedFilePath);
              },
              fail: (err) => {
                reject(`图片保存失败：${err.errMsg}`);
              }
            });
          });
        });

        // 批量处理图片保存
        Promise.all(savePromises)
          .then(savedPaths => {
            this.setData({
              selectedImages: [...selectedImages, ...savedPaths]
            });
          })
          .catch(err => {
            wx.showToast({ title: err, icon: "none" });
            console.error(err);
          });
      }
    });
  },

  // 删除选中的图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const { selectedImages } = this.data;
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    this.setData({ selectedImages: newImages });
  },

  // 预览列表页缩略图
  previewThumb(e) {
    const memoId = e.currentTarget.dataset.id;
    const { memos } = this.data;
    const memo = memos.find(item => item.id === memoId);

    if (memo?.images && memo.images.length > 0) {
      wx.previewImage({
        current: memo.images[0], // 当前预览的图片
        urls: memo.images // 所有图片列表（支持左右滑动切换）
      });
    }
  },

  addMemo() {
    const { newTitle, newContent, selectedImages, memos, maxTitleLength, maxInputLength } = this.data;
    const trimmedTitle = newTitle.trim();
    
    // 标题校验
    if (!trimmedTitle) {
      wx.showToast({ title: "标题不能为空", icon: "none" });
      return;
    }
    if (trimmedTitle.length > maxTitleLength) {
      wx.showToast({ 
        title: `标题不能超过${maxTitleLength}个字符`, 
        icon: "none" 
      });
      return;
    }

    // 内容校验（可选）
    const trimmedContent = newContent.trim();
    if (trimmedContent.length > maxInputLength) {
      wx.showToast({ 
        title: `内容不能超过${maxInputLength}个字符`, 
        icon: "none" 
      });
      return;
    }

    // 存储原始内容+处理后内容+图片路径
    const createTime = this.formatTime(new Date());
    const newMemo = {
      id: Date.now().toString(),
      title: trimmedTitle,
      content: trimmedContent, // 原始内容（详情页用）
      processedContent: this.processLongString(trimmedContent), // 处理后内容（列表页用）
      images: [...selectedImages], // 存储图片本地路径（持久化）
      createTime: createTime
    };

    this.setData({
      memos: [newMemo, ...memos],
      newTitle: "",
      newContent: "",
      selectedImages: [],
      showInput: false
    });

    // 本地存储：确保关闭小程序后数据不丢失
    wx.setStorageSync("memos", [newMemo, ...memos]);
    wx.showToast({ title: "添加成功" });
  },

  // 长文本处理逻辑（仅用于列表页换行）
  processLongString(str) {
    const regex = /([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15})/g;
    return str ? str.replace(regex, '$1\u200B') : "";
  },

  deleteMemo(e) {
    const memoId = e.currentTarget.dataset.id;
    const { memos } = this.data;
    const deletedMemo = memos.find(item => item.id === memoId);
    const newMemos = memos.filter(item => item.id !== memoId);
    
    this.setData({ memos: newMemos });
    wx.setStorageSync("memos", newMemos);

    // 清理图片缓存（使用FileSystemManager替代wx.removeSavedFile）
    if (deletedMemo?.images?.length > 0) {
      const fs = wx.getFileSystemManager();
      deletedMemo.images.forEach(filePath => {
        // 检查文件是否存在，存在则删除
        fs.access({
          path: filePath,
          success: () => {
            fs.unlink({
              filePath: filePath,
              fail: (err) => {
                console.error(`清理图片缓存失败：${err.errMsg}`);
              }
            });
          },
          fail: (err) => {
            console.error(`图片文件不存在：${err.errMsg}`);
          }
        });
      });
    }

    wx.showToast({ title: "已删除" });
  },

  goToDetail(e) {
    const memoId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${memoId}`
    });
  },

  // 页面加载：读取本地存储
  onLoad() {
    const storedMemos = wx.getStorageSync("memos") || [];
    const processedMemos = storedMemos.map(memo => ({
      ...memo,
      title: memo.title || "未命名备忘录",
      content: memo.content || "",
      processedContent: memo.processedContent || this.processLongString(memo.content || ""),
      images: memo.images || []
    }));
    this.setData({ memos: processedMemos });
  },

  formatTime(date) {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hour = this.padZero(date.getHours());
    const minute = this.padZero(date.getMinutes());

    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
  
  padZero(n) {
    return n < 10 ? `0${n}` : n;
  },

  cancelInput() {
    this.setData({
      showInput: false,
      newTitle: "",
      newContent: "",
      selectedImages: []
    });
  }
});