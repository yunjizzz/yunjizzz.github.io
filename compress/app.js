(() => {
  const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

  const state = {
    files: [],
    results: [],
    totalSize: 0,
    processing: false,
  };

  // --- DOM references ---
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const fileListSection = document.getElementById('file-list-section');
  const fileListTotal = document.getElementById('file-list-total');
  const capacityValue = document.getElementById('capacity-value');
  const capacityFill = document.getElementById('capacity-fill');
  const compressBtn = document.getElementById('compress-btn');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('results-list');
  const downloadAllBtn = document.getElementById('download-all-btn');
  const processingOverlay = document.getElementById('processing-overlay');
  const processingSub = document.getElementById('processing-sub');
  const processingFill = document.getElementById('processing-fill');
  const processingFileName = document.getElementById('processing-file-name');

  // --- Quality presets ---
  const qualityPresets = {
    max:      { bitrateMultiplier: 0.25 },
    standard: { bitrateMultiplier: 0.5 },
    high:     { bitrateMultiplier: 0.75 },
  };

  function getSelectedQuality() {
    const checked = document.querySelector('input[name="quality"]:checked');
    return checked ? checked.value : 'standard';
  }

  // --- Helpers ---
  function formatSize(bytes) {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function calculateReduction(original, compressed) {
    var pct = ((original - compressed) / original) * 100;
    return pct.toFixed(1);
  }

  // --- Capacity UI ---
  function updateCapacityUI() {
    var mb = state.totalSize / (1024 * 1024);
    var maxMb = MAX_TOTAL_SIZE / (1024 * 1024);
    capacityValue.textContent = mb.toFixed(0) + ' MB / ' + maxMb.toLocaleString() + ' MB (2 GB)';
    var pct = Math.min((state.totalSize / MAX_TOTAL_SIZE) * 100, 100);
    capacityFill.style.width = pct + '%';

    if (state.totalSize >= MAX_TOTAL_SIZE) {
      dropzone.classList.add('disabled');
    } else {
      dropzone.classList.remove('disabled');
    }
  }

  // --- File list UI ---
  function renderFileList() {
    fileList.innerHTML = '';
    if (state.files.length === 0) {
      fileListSection.style.display = 'none';
      compressBtn.disabled = true;
      return;
    }

    fileListSection.style.display = '';
    fileListTotal.textContent = state.files.length + I18n.t('filelist.count') + ' · ' + formatSize(state.totalSize);
    compressBtn.disabled = false;

    state.files.forEach(function (file, index) {
      var item = document.createElement('div');
      item.className = 'file-item';
      item.dataset.index = index;
      item.setAttribute('role', 'listitem');
      item.innerHTML =
        '<div class="file-item-icon">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<polygon points="23 7 16 12 23 17 23 7"></polygon>' +
            '<rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>' +
          '</svg>' +
        '</div>' +
        '<div class="file-item-info">' +
          '<div class="file-item-name">' + file.name + '</div>' +
          '<div class="file-item-size">' + formatSize(file.size) + '</div>' +
        '</div>' +
        '<button class="file-item-remove" data-index="' + index + '" aria-label="' + I18n.t('error.remove', { name: file.name }) + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
          '</svg>' +
        '</button>';
      fileList.appendChild(item);
    });
  }

  // --- Add files ---
  function addFiles(fileArray) {
    var allowed = ['.mp4'];
    var added = false;

    for (var i = 0; i < fileArray.length; i++) {
      var file = fileArray[i];
      var ext = '.' + file.name.split('.').pop().toLowerCase();
      if (allowed.indexOf(ext) === -1) continue;

      if (state.totalSize + file.size > MAX_TOTAL_SIZE) {
        alert(I18n.t('alert.capacityExceeded', { name: file.name }));
        continue;
      }

      state.files.push(file);
      state.totalSize += file.size;
      added = true;
    }

    if (added) {
      state.results = [];
      resultsSection.style.display = 'none';
      resultsList.innerHTML = '';
      renderFileList();
      updateCapacityUI();
    }
  }

  // --- Remove file ---
  function removeFile(index) {
    var file = state.files[index];
    if (!file) return;

    state.totalSize -= file.size;
    state.files.splice(index, 1);

    state.results = [];
    resultsSection.style.display = 'none';
    resultsList.innerHTML = '';

    renderFileList();
    updateCapacityUI();
  }

  // --- Drag & drop ---
  dropzone.addEventListener('click', function () {
    if (dropzone.classList.contains('disabled')) return;
    fileInput.click();
  });

  dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    if (dropzone.classList.contains('disabled')) return;
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', function () {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (dropzone.classList.contains('disabled')) return;
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      addFiles(Array.from(fileInput.files));
      fileInput.value = '';
    }
  });

  // --- File remove delegation ---
  fileList.addEventListener('click', function (e) {
    var btn = e.target.closest('.file-item-remove');
    if (!btn) return;
    var index = parseInt(btn.dataset.index, 10);
    removeFile(index);
  });

  // --- WebCodecs support check ---
  function isWebCodecsSupported() {
    return typeof VideoEncoder !== 'undefined' && typeof VideoDecoder !== 'undefined';
  }

  // --- Get video decoder config from MP4Box track ---
  function getVideoDecoderConfig(videoTrack, mp4file) {
    var codec = videoTrack.codec;
    var description;

    try {
      var trak = mp4file.getTrackById(videoTrack.id);
      if (trak && trak.mdia && trak.mdia.minf && trak.mdia.minf.stbl && trak.mdia.minf.stbl.stsd) {
        var entries = trak.mdia.minf.stbl.stsd.entries;
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          var box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
          if (box) {
            var stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
            box.write(stream);
            description = new Uint8Array(stream.buffer, 8); // skip box header
            break;
          }
        }
      }
    } catch (e) {
      console.warn('codec description 추출 실패:', e);
    }

    var config = {
      codec: codec,
      codedWidth: videoTrack.video.width,
      codedHeight: videoTrack.video.height,
    };

    if (description) {
      config.description = description;
    }

    return config;
  }

  // --- Compress single file using streaming/chunked WebCodecs pipeline ---
  function compressFile(file, bitrateMultiplier, onProgress) {
    return new Promise(function (resolve, reject) {
      var CHUNK_SIZE = 1024 * 1024; // 1MB
      var offset = 0;

      var mp4file = MP4Box.createFile();
      var videoTrack = null;
      var audioTrack = null;
      var audioSamples = [];

      var totalVideoSamples = 0;
      var processedSamples = 0;
      var firstKeyframeFound = false;

      var videoDecoder = null;
      var videoEncoder = null;
      var muxer = null;

      var feedingDone = false;
      var allSamplesReceived = false;
      var receivedVideoSamples = 0;
      var receivedAudioSamples = 0;
      var pipelineReady = false;
      var feedPaused = false;
      var rejected = false;

      function doReject(err) {
        if (rejected) return;
        rejected = true;
        reject(err);
      }

      function tryFinalize() {
        if (!allSamplesReceived) return;
        if (!videoDecoder || !videoEncoder) return;

        videoDecoder.flush().then(function () {
          return videoEncoder.flush();
        }).then(function () {
          // Add buffered audio samples
          if (audioTrack && audioSamples.length > 0) {
            for (var a = 0; a < audioSamples.length; a++) {
              var audioSample = audioSamples[a];
              var timestamp = (audioSample.cts * 1000000) / audioSample.timescale;
              var sampleDuration = (audioSample.duration * 1000000) / audioSample.timescale;
              muxer.addAudioChunkRaw(
                audioSample.data,
                'key',
                timestamp,
                sampleDuration
              );
            }
          }

          muxer.finalize();

          var resultBuffer = muxer.target.buffer;
          var compressedBlob = new Blob([resultBuffer], { type: 'video/mp4' });

          videoEncoder.close();
          videoDecoder.close();

          resolve(compressedBlob);
        }).catch(function (err) {
          doReject(err);
        });
      }

      function checkAllSamplesReceived() {
        if (!feedingDone || !videoTrack) return;
        var videoDone = receivedVideoSamples >= totalVideoSamples;
        var audioDone = !audioTrack || receivedAudioSamples >= audioTrack.nb_samples;
        if (videoDone && audioDone) {
          allSamplesReceived = true;
          tryFinalize();
        }
      }

      function feedNextChunk() {
        if (rejected) return;
        if (offset >= file.size) {
          feedingDone = true;
          mp4file.flush();
          checkAllSamplesReceived();
          return;
        }
        var end = Math.min(offset + CHUNK_SIZE, file.size);
        var slice = file.slice(offset, end);
        slice.arrayBuffer().then(function (buf) {
          if (rejected) return;
          buf.fileStart = offset;
          mp4file.appendBuffer(buf);
          offset += buf.byteLength;

          // Always continue feeding unless paused by backpressure
          if (!feedPaused) {
            feedNextChunk();
          }
        }).catch(function (err) {
          doReject(new Error(I18n.t('error.fileRead', { message: err.message })));
        });
      }

      function resumeFeed() {
        if (feedPaused && videoDecoder && videoDecoder.decodeQueueSize <= 5) {
          feedPaused = false;
          feedNextChunk();
        }
      }

      function setupPipeline(vTrack, aTrack, info) {
        var duration = info.duration / info.timescale;
        var originalBitrate = vTrack.bitrate || ((file.size * 8) / duration);
        var targetBitrate = Math.round(originalBitrate * bitrateMultiplier);
        if (targetBitrate < 100000) targetBitrate = 100000;

        // Setup muxer
        var muxerConfig = {
          target: new Mp4Muxer.ArrayBufferTarget(),
          video: {
            codec: 'avc',
            width: vTrack.video.width,
            height: vTrack.video.height,
          },
          fastStart: 'in-memory',
        };

        if (aTrack) {
          muxerConfig.audio = {
            codec: 'aac',
            numberOfChannels: aTrack.audio.channel_count,
            sampleRate: aTrack.audio.sample_rate,
          };
        }

        muxer = new Mp4Muxer.Muxer(muxerConfig);

        // Setup VideoEncoder
        videoEncoder = new VideoEncoder({
          output: function (chunk, meta) {
            muxer.addVideoChunk(chunk, meta);
          },
          error: function (err) {
            doReject(new Error(I18n.t('error.encoderError', { message: err.message })));
          },
        });

        var encoderConfig = {
          codec: 'avc1.640028',
          width: vTrack.video.width,
          height: vTrack.video.height,
          bitrate: targetBitrate,
          bitrateMode: 'variable',
        };

        VideoEncoder.isConfigSupported(encoderConfig).then(function (support) {
          if (!support.supported) {
            encoderConfig.codec = 'avc1.42001e';
            return VideoEncoder.isConfigSupported(encoderConfig);
          }
          return support;
        }).then(function (support) {
          if (!support.supported) {
            doReject(new Error(I18n.t('error.noCodec')));
            return;
          }

          videoEncoder.configure(support.config);

          // Setup VideoDecoder
          videoDecoder = new VideoDecoder({
            output: function (frame) {
              videoEncoder.encode(frame, { keyFrame: processedSamples % 60 === 0 });
              frame.close();
              processedSamples++;
              if (onProgress) {
                onProgress(processedSamples / totalVideoSamples);
              }
            },
            error: function (err) {
              doReject(new Error(I18n.t('error.decoderError', { message: err.message })));
            },
          });

          // Listen for dequeue to implement backpressure
          videoDecoder.addEventListener('dequeue', resumeFeed);

          var decoderConfig = getVideoDecoderConfig(vTrack, mp4file);

          VideoDecoder.isConfigSupported(decoderConfig).then(function (decoderSupport) {
            if (!decoderSupport.supported) {
              doReject(new Error(I18n.t('error.decoderUnsupported', { codec: decoderConfig.codec })));
              return;
            }

            videoDecoder.configure(decoderSupport.config);

            // Pipeline is ready, start extraction and continue feeding
            mp4file.setExtractionOptions(vTrack.id, 'video', { nbSamples: 50 });
            if (aTrack) {
              mp4file.setExtractionOptions(aTrack.id, 'audio', { nbSamples: 50 });
            }
            mp4file.start();

            pipelineReady = true;
          }).catch(function (err) {
            doReject(err);
          });
        }).catch(function (err) {
          doReject(err);
        });
      }

      mp4file.onReady = function (info) {
        for (var i = 0; i < info.tracks.length; i++) {
          var track = info.tracks[i];
          if (track.type === 'video' && !videoTrack) {
            videoTrack = track;
            totalVideoSamples = track.nb_samples;
          } else if (track.type === 'audio' && !audioTrack) {
            audioTrack = track;
          }
        }

        if (!videoTrack) {
          doReject(new Error(I18n.t('error.noVideoTrack')));
          return;
        }

        setupPipeline(videoTrack, audioTrack, info);
      };

      mp4file.onSamples = function (trackId, ref, samples) {
        if (videoTrack && trackId === videoTrack.id) {
          for (var i = 0; i < samples.length; i++) {
            receivedVideoSamples++;

            // Skip until first keyframe
            if (!firstKeyframeFound && !samples[i].is_sync) {
              samples[i].data = null;
              continue;
            }
            firstKeyframeFound = true;

            var chunk = new EncodedVideoChunk({
              type: samples[i].is_sync ? 'key' : 'delta',
              timestamp: (samples[i].cts * 1000000) / samples[i].timescale,
              duration: (samples[i].duration * 1000000) / samples[i].timescale,
              data: samples[i].data,
            });
            videoDecoder.decode(chunk);

            // Release sample data to free memory
            samples[i].data = null;
          }

          // Backpressure: pause feeding if decoder queue is too large
          if (videoDecoder.decodeQueueSize > 10) {
            feedPaused = true;
          }

          checkAllSamplesReceived();
        } else if (audioTrack && trackId === audioTrack.id) {
          for (var j = 0; j < samples.length; j++) {
            audioSamples.push(samples[j]);
            receivedAudioSamples++;
          }
          checkAllSamplesReceived();
        }
      };

      mp4file.onError = function (err) {
        doReject(err);
      };

      // Start feeding the first chunk to trigger onReady
      feedNextChunk();
    });
  }

  // --- Compress all files ---
  async function compressFiles() {
    if (state.processing || state.files.length === 0) return;

    if (!isWebCodecsSupported()) {
      alert(I18n.t('alert.webcodecs'));
      return;
    }

    state.processing = true;
    processingOverlay.style.display = 'flex';
    compressBtn.disabled = true;
    state.results = [];

    var total = state.files.length;
    var quality = getSelectedQuality();
    var bitrateMultiplier = qualityPresets[quality].bitrateMultiplier;

    for (var i = 0; i < total; i++) {
      var file = state.files[i];
      processingSub.textContent = I18n.t('processing.progress', { current: i + 1, total: total });
      processingFileName.textContent = file.name;
      processingFill.style.width = ((i / total) * 100) + '%';

      try {
        var compressedBlob = await compressFile(file, bitrateMultiplier, function (progress) {
          var overallProgress = ((i + progress) / total) * 100;
          processingFill.style.width = overallProgress + '%';
        });

        state.results.push({
          name: file.name.replace(/\.[^.]+$/, '') + '_compressed.mp4',
          originalSize: file.size,
          compressedBlob: compressedBlob,
          compressedSize: compressedBlob.size,
        });
      } catch (err) {
        console.error('압축 실패:', file.name, err);
        state.results.push({
          name: file.name,
          error: err.message || I18n.t('error.compressFailed'),
          originalSize: file.size,
        });
      }
    }

    renderResults();

    state.processing = false;
    processingOverlay.style.display = 'none';
    processingFill.style.width = '0%';
    compressBtn.disabled = state.files.length === 0;
  }

  // --- Results UI ---
  function renderResults() {
    resultsList.innerHTML = '';

    state.results.forEach(function (result, index) {
      var item = document.createElement('div');
      item.className = 'result-item';

      if (result.error) {
        item.innerHTML =
          '<div class="result-item-top">' +
            '<div class="result-item-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<polygon points="23 7 16 12 23 17 23 7"></polygon>' +
                '<rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>' +
              '</svg>' +
            '</div>' +
            '<div class="result-item-info">' +
              '<div class="result-item-name">' + result.name + '</div>' +
              '<div class="size-comparison">' +
                '<span class="size-original" style="color:#ef4444;">' + I18n.t('results.error') + ': ' + result.error + '</span>' +
              '</div>' +
            '</div>' +
          '</div>';
      } else {
        var reductionPct = parseFloat(calculateReduction(result.originalSize, result.compressedSize));
        var badgeClass = 'good';
        if (reductionPct < 0) badgeClass = 'poor';
        else if (reductionPct < 10) badgeClass = 'ok';

        var compressedRatio = (result.compressedSize / result.originalSize) * 100;
        var barWidth = Math.min(compressedRatio, 100).toFixed(1);

        item.innerHTML =
          '<div class="result-item-top">' +
            '<div class="result-item-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<polygon points="23 7 16 12 23 17 23 7"></polygon>' +
                '<rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>' +
              '</svg>' +
            '</div>' +
            '<div class="result-item-info">' +
              '<div class="result-item-name">' + result.name + '</div>' +
              '<div class="size-comparison">' +
                '<span class="size-original">' + formatSize(result.originalSize) + '</span>' +
                '<span class="size-arrow">→</span>' +
                '<span class="size-compressed">' + formatSize(result.compressedSize) + '</span>' +
                '<span class="size-badge ' + badgeClass + '">' + (reductionPct >= 0 ? reductionPct : Math.abs(reductionPct)) + '% ' + (reductionPct >= 0 ? I18n.t('results.decreased') : I18n.t('results.increased')) + '</span>' +
              '</div>' +
            '</div>' +
            '<button class="download-btn" data-index="' + index + '">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
                '<polyline points="7 10 12 15 17 10"/>' +
                '<line x1="12" y1="15" x2="12" y2="3"/>' +
              '</svg>' +
              I18n.t('results.download') +
            '</button>' +
          '</div>' +
          '<div class="size-bar-wrap">' +
            '<div class="size-bar-row">' +
              '<span class="size-bar-label">' + I18n.t('size.original') + '</span>' +
              '<div class="size-bar-track"><div class="size-bar-fill original" style="width:100%"></div></div>' +
              '<span class="size-bar-value">' + formatSize(result.originalSize) + '</span>' +
            '</div>' +
            '<div class="size-bar-row">' +
              '<span class="size-bar-label">' + I18n.t('size.compressed') + '</span>' +
              '<div class="size-bar-track"><div class="size-bar-fill compressed" style="width:' + barWidth + '%"></div></div>' +
              '<span class="size-bar-value">' + formatSize(result.compressedSize) + '</span>' +
            '</div>' +
          '</div>';
      }

      resultsList.appendChild(item);
    });

    resultsSection.classList.add('active');
    resultsSection.style.display = '';
    downloadAllBtn.style.display = state.results.filter(function (r) { return !r.error; }).length > 1 ? '' : 'none';
  }

  // --- Download ---
  function downloadResult(index) {
    var result = state.results[index];
    if (!result || result.error) return;

    var url = URL.createObjectURL(result.compressedBlob);
    var a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  function downloadAll() {
    var validResults = state.results.filter(function (r) { return !r.error; });
    if (validResults.length === 0) return;

    if (validResults.length === 1) {
      var idx = state.results.indexOf(validResults[0]);
      downloadResult(idx);
      return;
    }

    validResults.forEach(function (result, i) {
      var idx = state.results.indexOf(result);
      setTimeout(function () { downloadResult(idx); }, i * 300);
    });
  }

  // --- Event listeners ---
  compressBtn.addEventListener('click', compressFiles);

  resultsList.addEventListener('click', function (e) {
    var btn = e.target.closest('.download-btn');
    if (!btn) return;
    var index = parseInt(btn.dataset.index, 10);
    downloadResult(index);
  });

  downloadAllBtn.addEventListener('click', downloadAll);

  // --- i18n re-render hook ---
  window.rerenderI18n = function () {
    updateCapacityUI();
    renderFileList();
    if (state.results.length > 0) {
      renderResults();
    }
  };

  // --- Init ---
  updateCapacityUI();
  renderFileList();
})();
