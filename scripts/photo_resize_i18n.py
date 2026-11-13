"""photo-resize 다국어 데이터: 화면 문구, 규격, FAQ, 언어별 랜딩 페이지 정의.

언어: ko(기본), en(인도·방글라데시·파키스탄·나이지리아 등 영어권). 관심 국가 순위(인도, 방글라데시, 탄자니아, 파키스탄, 나이지리아)에 인도네시아·브라질이 없어 id·pt는 비활성화.
"""

LANGS = ["ko", "en"]  # id(인도네시아어)·pt(포르투갈어) 데이터는 아래에 남겨 두었고, 여기에 추가하면 다시 생성됨
HREFLANG = {"ko": "ko", "en": "en", "id": "id", "pt": "pt-BR"}
OG_LOCALE = {"ko": "ko_KR", "en": "en_US", "id": "id_ID", "pt": "pt_BR"}
LANG_NAME = {"ko": "한국어", "en": "English", "id": "Bahasa Indonesia", "pt": "Português"}
BASE_PATH = {"ko": "/photo-resize/", "en": "/photo-resize/en/", "id": "/photo-resize/id/", "pt": "/photo-resize/pt/"}

# ------------------------------------------------------------------ 화면 문구
S = {}

S["ko"] = dict(
    brand="해봄", tool="사진 용량 줄이기", home_aria="해봄 홈", theme_aria="테마 전환",
    eyebrow="업로드 없이, 이 브라우저에서만 안전하게",
    noscript="이 도구는 JavaScript가 필요해요. 브라우저에서 JavaScript를 켜 주세요.",
    dz_aria="사진을 끌어다 놓거나 눌러서 선택", file_aria="사진 파일 선택",
    dz_title="사진을 끌어다 놓으세요", dz_more="사진 더 추가하기",
    dz_sub="여러 장도 한 번에 · 휴대폰 갤러리에서도 선택해요", dz_btn="사진 선택하기",
    dz_formats="JPG · PNG · WEBP · HEIC(일부 브라우저)",
    list_title="선택한 사진", list_total="{n}장 · {size}", remove="삭제",
    card_aria="미리보기와 결과", card_title_crop="위치와 크기 맞추기", card_hint_crop="사진을 끌어서 이동",
    card_title_orig="미리보기", card_hint_orig="원본 비율 그대로",
    live_alt="변환 결과 미리보기", live_label="지금 설정으로 저장하면", save_one="이 사진 저장",
    preview="미리보기", zoom="확대", guide="얼굴 위치 가이드 보기 (참고용)",
    panel_aria="변환 설정", step1="용량 (이하로)", kb_hint="1KB = 1,000바이트", kb_aria="목표 용량",
    kb_none="제한 없음", custom="직접 입력", kb_ph="예: 150", kb_custom_aria="목표 용량(KB)", kb_suffix="KB 이하",
    step2="사진 크기", step2_hint="기본은 규격에 맞춰 자르기", mode_aria="크기 방식",
    mode_crop="규격에 맞춰 자르기", mode_orig="원본 비율 유지",
    maxside_label="긴 변을 최대", maxside_orig="원본 그대로", note_orig="목표 용량이 있으면 필요한 만큼만 자동으로 줄여요.",
    preset_aria="규격", preset_custom="직접 입력 (px)", w="가로", h="세로", w_aria="가로 픽셀", h_aria="세로 픽셀",
    note_crop="cm 규격은 300dpi 기준 픽셀이에요. 제출처의 규격 안내를 먼저 확인하세요.",
    step3="저장 형식", fmt_jpg="대부분 사이트 호환", fmt_webp="더 작은 용량",
    btn_empty="사진을 먼저 선택하세요", btn_one="결과 확인하고 저장", btn_many="{n}장 한꺼번에 변환",
    processing="줄이는 중입니다...", results_aria="변환 결과", results_title="완료됐어요", zip="ZIP으로 한 번에 받기",
    why_kicker="Why 해봄", why_h2="왜 해봄에서 줄이면 안전할까요?",
    why1_t="업로드 없음", why1_p="사진은 내 기기 안에서만 처리돼서 서버로 전송되지 않아요. 얼굴 사진도 안심하세요.",
    why2_t="가장 선명하게", why2_p="화질을 한 단계씩 맞춰서 목표 용량을 넘지 않는 최고 화질을 찾아요.",
    why3_t="가입·워터마크 없음", why3_p="링크만 열면 바로 쓰고, 사용 횟수 제한도 유료 플랜도 없어요.",
    faq_h2="자주 묻는 질문",
    msg_bad="{n}개 파일은 열 수 없었어요. JPG·PNG·WEBP 사진인지 확인해 주세요. (아이폰 HEIC는 Safari에서 열리거나, 사진 앱에서 JPG로 내보낸 뒤 올려 주세요)",
    sum_label="설정", sum_kb="{kb} 이하", sum_kb_none="용량 제한 없음", sum_crop="{w}×{h}px로 자르기",
    sum_max="긴 변 {n}px 이하", sum_orig="원본 크기",
    crop_note="{w}×{h}px 규격 · 슬라이더로 확대, 끌어서 위치 조정",
    calc="계산 중…", fail="이 사진은 변환하지 못했어요", meta_orig="원본",
    kept="이미 목표보다 작아서 원본 그대로예요", ok_target="✓ {kb} 이하로 맞췄어요", ok_plain="✓ 완료",
    warn_live="⚠ {kb}까지는 줄이지 못했어요. 목표 용량을 키워 보세요",
    res_ok_plain="변환 완료", warn_res="⚠ {kb}까지는 줄이지 못했어요. 규격 크기를 줄이거나 목표 용량을 키워 보세요",
    save="저장", tag_resize="리사이즈", zip_name="사진_용량줄이기.zip",
)

S["en"] = dict(
    brand="Haebom", tool="Resize Image to KB", home_aria="Haebom home", theme_aria="Toggle theme",
    eyebrow="No upload. Your photo stays in this browser.",
    noscript="This tool needs JavaScript. Please enable it in your browser.",
    dz_aria="Drop photos here or click to choose", file_aria="Choose photo files",
    dz_title="Drop your photos here", dz_more="Add more photos",
    dz_sub="Several at once · works with your phone gallery too", dz_btn="Choose photos",
    dz_formats="JPG · PNG · WEBP · HEIC (some browsers)",
    list_title="Selected photos", list_total="{n} photos · {size}", remove="Remove",
    card_aria="Preview and result", card_title_crop="Adjust position and zoom", card_hint_crop="Drag the photo to move it",
    card_title_orig="Preview", card_hint_orig="Original proportions",
    live_alt="Result preview", live_label="If you save with the current settings", save_one="Save this photo",
    preview="Preview", zoom="Zoom", guide="Show face position guide (for reference)",
    panel_aria="Settings", step1="File size (up to)", kb_hint="1KB = 1,000 bytes", kb_aria="Target file size",
    kb_none="No limit", custom="Custom", kb_ph="e.g. 150", kb_custom_aria="Target size in KB", kb_suffix="KB or less",
    step2="Photo size", step2_hint="Default: crop to a preset size", mode_aria="Size mode",
    mode_crop="Crop to a preset size", mode_orig="Keep original ratio",
    maxside_label="Longest side up to", maxside_orig="Original", note_orig="If you set a file size limit, the photo is shrunk only as much as needed.",
    preset_aria="Preset sizes", preset_custom="Custom (px)", w="Width", h="Height", w_aria="Width in pixels", h_aria="Height in pixels",
    note_crop="Millimeter and inch sizes are converted at 300 dpi. Always check the size rules of the form or portal you are submitting to.",
    step3="Save as", fmt_jpg="Accepted almost everywhere", fmt_webp="Smaller files",
    btn_empty="Choose a photo first", btn_one="Check result and save", btn_many="Convert all {n} photos",
    processing="Working on it...", results_aria="Results", results_title="All done", zip="Download all as ZIP",
    why_kicker="Why Haebom", why_h2="Why is it safe to use?",
    why1_t="No upload", why1_p="Your photo is processed only inside your device and never sent to a server. Safe even for ID photos.",
    why2_t="Best possible quality", why2_p="We tune the quality step by step to find the sharpest result that stays within your size limit.",
    why3_t="No sign-up, no watermark", why3_p="Open the link and use it. No usage limits and no paid plan.",
    faq_h2="Frequently asked questions",
    msg_bad="{n} file(s) could not be opened. Please use JPG, PNG or WEBP photos. (iPhone HEIC opens in Safari; otherwise export it as JPG from the Photos app first.)",
    sum_label="Settings", sum_kb="{kb} or less", sum_kb_none="No size limit", sum_crop="Crop to {w}×{h}px",
    sum_max="Longest side ≤ {n}px", sum_orig="Original size",
    crop_note="{w}×{h}px · zoom with the slider, drag to reposition",
    calc="Calculating…", fail="This photo could not be converted", meta_orig="Original",
    kept="Already smaller than the limit, so the original is kept", ok_target="✓ Fits within {kb}", ok_plain="✓ Done",
    warn_live="⚠ Could not get under {kb}. Try a higher limit.",
    res_ok_plain="Done", warn_res="⚠ Could not get under {kb}. Try a smaller preset size or a higher limit.",
    save="Save", tag_resize="resized", zip_name="photos-resized.zip",
)

S["id"] = dict(
    brand="Haebom", tool="Perkecil Ukuran Foto", home_aria="Beranda Haebom", theme_aria="Ganti tema",
    eyebrow="Tanpa unggah. Foto hanya diproses di browser ini.",
    noscript="Alat ini membutuhkan JavaScript. Aktifkan JavaScript di browser Anda.",
    dz_aria="Tarik foto ke sini atau klik untuk memilih", file_aria="Pilih file foto",
    dz_title="Tarik foto ke sini", dz_more="Tambah foto lagi",
    dz_sub="Banyak foto sekaligus · bisa dari galeri HP", dz_btn="Pilih foto",
    dz_formats="JPG · PNG · WEBP · HEIC (di beberapa browser)",
    list_title="Foto terpilih", list_total="{n} foto · {size}", remove="Hapus",
    card_aria="Pratinjau dan hasil", card_title_crop="Atur posisi dan zoom", card_hint_crop="Geser foto untuk memindahkan",
    card_title_orig="Pratinjau", card_hint_orig="Rasio asli",
    live_alt="Pratinjau hasil", live_label="Jika disimpan dengan pengaturan sekarang", save_one="Simpan foto ini",
    preview="Pratinjau", zoom="Zoom", guide="Tampilkan panduan posisi wajah (sebagai acuan)",
    panel_aria="Pengaturan", step1="Ukuran file (maksimal)", kb_hint="1KB = 1.000 byte", kb_aria="Target ukuran file",
    kb_none="Tanpa batas", custom="Isi sendiri", kb_ph="mis. 150", kb_custom_aria="Target ukuran dalam KB", kb_suffix="KB atau kurang",
    step2="Ukuran foto", step2_hint="Bawaan: potong sesuai ukuran pas foto", mode_aria="Mode ukuran",
    mode_crop="Potong sesuai ukuran", mode_orig="Pertahankan rasio asli",
    maxside_label="Sisi terpanjang maksimal", maxside_orig="Asli", note_orig="Jika target ukuran file diisi, foto hanya dikecilkan seperlunya.",
    preset_aria="Ukuran siap pakai", preset_custom="Isi sendiri (px)", w="Lebar", h="Tinggi", w_aria="Lebar dalam piksel", h_aria="Tinggi dalam piksel",
    note_crop="Ukuran cm dikonversi ke piksel pada 300 dpi. Selalu cek ketentuan ukuran pada formulir atau portal pendaftaran Anda.",
    step3="Simpan sebagai", fmt_jpg="Diterima hampir di semua situs", fmt_webp="File lebih kecil",
    btn_empty="Pilih foto terlebih dahulu", btn_one="Cek hasil dan simpan", btn_many="Proses {n} foto sekaligus",
    processing="Sedang memproses...", results_aria="Hasil", results_title="Selesai", zip="Unduh semua sebagai ZIP",
    why_kicker="Kenapa Haebom", why_h2="Kenapa aman digunakan?",
    why1_t="Tanpa unggah", why1_p="Foto diproses hanya di perangkat Anda dan tidak dikirim ke server. Aman untuk pas foto.",
    why2_t="Kualitas terbaik", why2_p="Kualitas diatur bertahap untuk mendapatkan hasil paling tajam yang tetap di bawah batas ukuran.",
    why3_t="Tanpa daftar, tanpa watermark", why3_p="Cukup buka tautan dan pakai. Tanpa batas penggunaan dan tanpa paket berbayar.",
    faq_h2="Pertanyaan yang sering diajukan",
    msg_bad="{n} file tidak dapat dibuka. Gunakan foto JPG, PNG, atau WEBP. (HEIC iPhone bisa dibuka di Safari; jika tidak, ekspor dulu sebagai JPG dari aplikasi Foto.)",
    sum_label="Pengaturan", sum_kb="maks. {kb}", sum_kb_none="Tanpa batas ukuran", sum_crop="Potong {w}×{h}px",
    sum_max="Sisi terpanjang ≤ {n}px", sum_orig="Ukuran asli",
    crop_note="{w}×{h}px · zoom dengan penggeser, geser foto untuk mengatur posisi",
    calc="Menghitung…", fail="Foto ini tidak dapat diproses", meta_orig="Asli",
    kept="Sudah lebih kecil dari batas, jadi file asli dipertahankan", ok_target="✓ Sesuai batas {kb}", ok_plain="✓ Selesai",
    warn_live="⚠ Tidak bisa mencapai {kb}. Coba naikkan batasnya.",
    res_ok_plain="Selesai", warn_res="⚠ Tidak bisa mencapai {kb}. Coba ukuran yang lebih kecil atau naikkan batasnya.",
    save="Simpan", tag_resize="diperkecil", zip_name="foto-diperkecil.zip",
)

S["pt"] = dict(
    brand="Haebom", tool="Reduzir Tamanho da Foto", home_aria="Início do Haebom", theme_aria="Alternar tema",
    eyebrow="Sem upload. Sua foto fica só neste navegador.",
    noscript="Esta ferramenta precisa de JavaScript. Ative o JavaScript no navegador.",
    dz_aria="Arraste as fotos aqui ou clique para escolher", file_aria="Escolher arquivos de foto",
    dz_title="Arraste suas fotos aqui", dz_more="Adicionar mais fotos",
    dz_sub="Várias de uma vez · funciona com a galeria do celular", dz_btn="Escolher fotos",
    dz_formats="JPG · PNG · WEBP · HEIC (alguns navegadores)",
    list_title="Fotos selecionadas", list_total="{n} fotos · {size}", remove="Remover",
    card_aria="Pré-visualização e resultado", card_title_crop="Ajuste a posição e o zoom", card_hint_crop="Arraste a foto para mover",
    card_title_orig="Pré-visualização", card_hint_orig="Proporção original",
    live_alt="Pré-visualização do resultado", live_label="Se salvar com as configurações atuais", save_one="Salvar esta foto",
    preview="Pré-visualização", zoom="Zoom", guide="Mostrar guia de posição do rosto (apenas referência)",
    panel_aria="Configurações", step1="Tamanho do arquivo (até)", kb_hint="1 KB = 1.000 bytes", kb_aria="Tamanho desejado do arquivo",
    kb_none="Sem limite", custom="Personalizado", kb_ph="ex.: 150", kb_custom_aria="Tamanho desejado em KB", kb_suffix="KB ou menos",
    step2="Tamanho da foto", step2_hint="Padrão: cortar no tamanho escolhido", mode_aria="Modo de tamanho",
    mode_crop="Cortar no tamanho", mode_orig="Manter proporção original",
    maxside_label="Maior lado até", maxside_orig="Original", note_orig="Se houver limite de tamanho, a foto é reduzida só o necessário.",
    preset_aria="Tamanhos prontos", preset_custom="Personalizado (px)", w="Largura", h="Altura", w_aria="Largura em pixels", h_aria="Altura em pixels",
    note_crop="Tamanhos em cm são convertidos a 300 dpi. Confira sempre as regras de tamanho do formulário ou site em que vai enviar.",
    step3="Salvar como", fmt_jpg="Aceito quase em todo lugar", fmt_webp="Arquivos menores",
    btn_empty="Escolha uma foto primeiro", btn_one="Ver resultado e salvar", btn_many="Converter as {n} fotos",
    processing="Processando...", results_aria="Resultados", results_title="Pronto", zip="Baixar tudo em ZIP",
    why_kicker="Por que o Haebom", why_h2="Por que é seguro usar?",
    why1_t="Sem upload", why1_p="A foto é processada só no seu aparelho e nunca é enviada a um servidor. Seguro até para fotos de documento.",
    why2_t="Melhor qualidade possível", why2_p="Ajustamos a qualidade aos poucos para achar o resultado mais nítido dentro do limite de tamanho.",
    why3_t="Sem cadastro, sem marca d'água", why3_p="Abriu o link, usou. Sem limite de uso e sem plano pago.",
    faq_h2="Perguntas frequentes",
    msg_bad="{n} arquivo(s) não puderam ser abertos. Use fotos JPG, PNG ou WEBP. (O HEIC do iPhone abre no Safari; senão, exporte como JPG pelo app Fotos.)",
    sum_label="Configurações", sum_kb="até {kb}", sum_kb_none="Sem limite de tamanho", sum_crop="Cortar em {w}×{h}px",
    sum_max="Maior lado ≤ {n}px", sum_orig="Tamanho original",
    crop_note="{w}×{h}px · zoom no controle deslizante, arraste para posicionar",
    calc="Calculando…", fail="Não foi possível converter esta foto", meta_orig="Original",
    kept="Já está menor que o limite, então o original foi mantido", ok_target="✓ Dentro de {kb}", ok_plain="✓ Pronto",
    warn_live="⚠ Não foi possível chegar a {kb}. Tente um limite maior.",
    res_ok_plain="Pronto", warn_res="⚠ Não foi possível chegar a {kb}. Tente um tamanho menor ou um limite maior.",
    save="Salvar", tag_resize="reduzida", zip_name="fotos-reduzidas.zip",
)

# ------------------------------------------------------------------ 규격 (id, 큰 글씨, 작은 글씨, 가로px, 세로px, 파일명 꼬리표)
PRESETS = {
    "ko": [
        ("p3545", "3.5×4.5cm", "413×531px · 여권", 413, 531, "3.5x4.5cm"),
        ("p34", "3×4cm", "354×472px · 증명", 354, 472, "3x4cm"),
        ("p600", "3:4", "600×800px", 600, 800, "600x800"),
        ("p1x1", "1:1", "500×500px", 500, 500, "500x500"),
    ],
    "en": [
        ("p3545", "35×45 mm", "413×531 px · passport (India/UK/EU)", 413, 531, "35x45mm"),
        ("pus", "2×2 in", "600×600 px · US passport/visa", 600, 600, "2x2in"),
        ("p200230", "200×230 px", "common for exam forms", 200, 230, "200x230"),
        ("p1x1", "1:1", "500×500 px", 500, 500, "500x500"),
    ],
    "id": [
        ("p34", "3×4 cm", "354×472 px · pas foto", 354, 472, "3x4cm"),
        ("p46", "4×6 cm", "472×709 px · pas foto", 472, 709, "4x6cm"),
        ("p23", "2×3 cm", "236×354 px", 236, 354, "2x3cm"),
        ("p1x1", "1:1", "500×500 px", 500, 500, "500x500"),
    ],
    "pt": [
        ("p34", "3×4 cm", "354×472 px · foto 3x4", 354, 472, "3x4cm"),
        ("p57", "5×7 cm", "591×827 px · passaporte", 591, 827, "5x7cm"),
        ("p3545", "3,5×4,5 cm", "413×531 px", 413, 531, "3.5x4.5cm"),
        ("p1x1", "1:1", "500×500 px", 500, 500, "500x500"),
    ],
}

# ------------------------------------------------------------------ 공통 FAQ (질문, 답)
FAQ = {}
FAQ["ko"] = [
    ("사진 용량을 줄이면 화질이 나빠지나요?",
     "용량을 줄이는 만큼 어느 정도 화질은 낮아져요. 다만 해봄은 목표 용량을 넘지 않는 선에서 가장 높은 화질을 찾아 저장하고, 필요할 때만 크기(픽셀)를 줄입니다. 화면에서 보는 사진은 대부분 차이를 느끼기 어려워요."),
    ("100KB·200KB 같은 목표 용량은 어떻게 맞추나요?",
     "원하는 용량(20KB~1MB 또는 직접 입력)을 고르고 변환하면, 이하가 되는 가장 높은 JPG 화질을 자동으로 찾아요. 그래도 안 맞으면 크기를 조금씩 줄여서 맞춰요. 규격 크기로 자르는 경우에는 크기를 바꾸지 않고 화질만 조절합니다."),
    ("제 사진이 서버에 올라가나요?",
     "아니요. 사진 변환은 모두 내 브라우저 안에서 이뤄지고 사진 파일은 외부로 전송되지 않아요. 얼굴이 나온 증명사진처럼 민감한 사진도 안심하고 쓰세요."),
    ("KB와 MB는 어떻게 계산하나요?",
     "접수 사이트마다 1KB를 1,000바이트로 세기도, 1,024바이트로 세기도 해요. 해봄은 1KB를 1,000바이트로 계산해서, 어느 기준에서도 목표 용량을 넘지 않게 맞춰요. 1MB는 1,000KB예요."),
    ("증명사진·여권사진 규격은 몇 픽셀인가요?",
     "300dpi 기준으로 3.5×4.5cm는 413×531px, 3×4cm는 354×472px이에요. 계산식은 cm ÷ 2.54 × dpi입니다. 제출처가 요구하는 픽셀·dpi가 다르면 직접 입력으로 맞추세요."),
    ("“목표 용량까지 줄이지 못했어요”가 나오면 어떻게 하나요?",
     "규격 크기로 자르면 크기를 줄일 수 없어서 아주 작은 용량은 맞추기 어려울 수 있어요. 목표 용량을 조금 키우거나, ‘원본 비율 유지’로 바꿔 크기를 줄이는 방법을 써 보세요."),
    ("아이폰 사진(HEIC)이나 PNG도 되나요?",
     "JPG·PNG·WEBP는 모두 돼요. 아이폰의 HEIC는 Safari에서는 열리지만 일부 브라우저에서는 열리지 않아요. 그럴 땐 사진 앱에서 JPG로 내보낸 뒤 올려 주세요. 결과는 JPG 또는 WEBP로 저장돼요."),
    ("JPG와 WEBP 중 어떤 걸 고르나요?",
     "접수 사이트는 대부분 JPG만 받으니 JPG를 권장해요. WEBP는 같은 화질에서 용량이 더 작지만 받는 곳이 제한적이에요."),
    ("스마트폰에서도 쓸 수 있나요?",
     "네. 휴대폰 갤러리에서 사진을 선택해 변환하고 바로 저장할 수 있어요. 규격 자르기도 손가락으로 끌어서 맞출 수 있습니다."),
]
FAQ["en"] = [
    ("Does reducing the file size hurt photo quality?",
     "A smaller file always means some loss of detail. Haebom searches for the highest quality that still stays under your limit and only shrinks the pixel size when it has to. On a screen, most photos look the same."),
    ("How do I resize an image to 20KB, 50KB or 100KB?",
     "Pick the limit (20KB to 1MB, or type your own) and the tool finds the highest JPG quality that fits. If that is not enough it reduces the dimensions step by step. When you crop to a preset size the dimensions stay fixed, so only the quality is adjusted."),
    ("Is my photo uploaded to a server?",
     "No. Everything happens inside your browser and the photo file is never sent anywhere. That makes it safe for ID and passport photos."),
    ("How are KB and MB counted?",
     "Some portals count 1KB as 1,000 bytes and others as 1,024. Haebom uses 1,000 bytes per KB, so the result stays under the limit either way. 1MB is 1,000KB."),
    ("What is the pixel size of a passport photo?",
     "At 300 dpi, 35×45 mm is 413×531 px and 2×2 inches is 600×600 px. The formula is size in inches × dpi (mm ÷ 25.4 × dpi). Rules differ by country and by form, so always follow the instructions of the site you are submitting to."),
    ("What if it says it could not get under my limit?",
     "A fixed preset size cannot be shrunk, so very small limits may not be reachable. Raise the limit a little, or switch to “Keep original ratio” so the dimensions can shrink too."),
    ("Does it work with iPhone HEIC photos and PNG files?",
     "JPG, PNG and WEBP always work. iPhone HEIC opens in Safari but not in every browser; if it fails, export the photo as JPG from the Photos app first. Results are saved as JPG or WEBP."),
    ("Should I choose JPG or WEBP?",
     "Choose JPG. Most application forms and government portals only accept JPG. WEBP gives smaller files at the same quality but is accepted in fewer places."),
    ("Can I use it on my phone?",
     "Yes. Pick photos from your gallery, adjust the crop with your finger and save the result directly."),
]
FAQ["id"] = [
    ("Apakah mengecilkan ukuran foto menurunkan kualitas?",
     "Ukuran file yang lebih kecil memang berarti ada sedikit detail yang hilang. Haebom mencari kualitas tertinggi yang masih di bawah batas Anda dan hanya mengecilkan dimensi bila perlu. Di layar, kebanyakan foto terlihat sama."),
    ("Bagaimana cara membuat foto 200KB untuk pendaftaran?",
     "Pilih batas ukuran (20KB sampai 1MB, atau isi sendiri). Alat ini mencari kualitas JPG tertinggi yang masih muat. Jika belum cukup, dimensi dikecilkan bertahap. Saat dipotong ke ukuran pas foto, dimensi tetap sehingga hanya kualitas yang diatur."),
    ("Apakah foto saya diunggah ke server?",
     "Tidak. Semua proses terjadi di browser Anda dan file foto tidak dikirim ke mana pun. Aman untuk pas foto."),
    ("Bagaimana KB dan MB dihitung?",
     "Sebagian portal menghitung 1KB = 1.000 byte, sebagian lain 1.024 byte. Haebom memakai 1.000 byte per KB sehingga hasilnya aman di kedua hitungan. 1MB = 1.000KB."),
    ("Berapa piksel pas foto 3x4 dan 4x6?",
     "Pada 300 dpi, 3×4 cm = 354×472 px, 4×6 cm = 472×709 px, dan 2×3 cm = 236×354 px. Rumusnya cm ÷ 2,54 × dpi. Ketentuan bisa berbeda tiap instansi, jadi ikuti petunjuk resmi pendaftaran Anda."),
    ("Bagaimana jika muncul pesan tidak bisa mencapai batas ukuran?",
     "Ukuran siap pakai tidak bisa dikecilkan, jadi batas yang sangat kecil mungkin tidak tercapai. Naikkan sedikit batasnya, atau pilih “Pertahankan rasio asli” agar dimensi ikut mengecil."),
    ("Apakah bisa untuk foto HEIC iPhone dan PNG?",
     "JPG, PNG, dan WEBP selalu bisa. HEIC iPhone terbuka di Safari tetapi tidak di semua browser; jika gagal, ekspor dulu sebagai JPG dari aplikasi Foto. Hasil disimpan sebagai JPG atau WEBP."),
    ("Pilih JPG atau WEBP?",
     "Pilih JPG. Hampir semua portal pendaftaran hanya menerima JPG. WEBP menghasilkan file lebih kecil pada kualitas yang sama tetapi diterima di lebih sedikit tempat."),
    ("Bisakah dipakai di HP?",
     "Bisa. Pilih foto dari galeri, atur potongan dengan jari, lalu simpan hasilnya langsung."),
]
FAQ["pt"] = [
    ("Reduzir o tamanho do arquivo piora a qualidade da foto?",
     "Um arquivo menor sempre perde algum detalhe. O Haebom procura a maior qualidade que ainda fica dentro do seu limite e só diminui as dimensões quando precisa. Na tela, a maioria das fotos parece igual."),
    ("Como deixar a foto com 100KB ou 200KB?",
     "Escolha o limite (de 20KB a 1MB, ou digite o seu) e a ferramenta acha a maior qualidade JPG que cabe. Se não bastar, reduz as dimensões aos poucos. Ao cortar em um tamanho pronto, as dimensões ficam fixas e só a qualidade é ajustada."),
    ("Minha foto é enviada para algum servidor?",
     "Não. Tudo acontece dentro do seu navegador e o arquivo nunca é enviado a lugar nenhum. É seguro para fotos de documento."),
    ("Como KB e MB são contados?",
     "Alguns sites contam 1 KB como 1.000 bytes e outros como 1.024. O Haebom usa 1.000 bytes por KB, então o resultado fica dentro do limite nos dois casos. 1 MB = 1.000 KB."),
    ("Quantos pixels tem uma foto 3x4 ou de passaporte?",
     "A 300 dpi, 3×4 cm = 354×472 px, 5×7 cm = 591×827 px e 3,5×4,5 cm = 413×531 px. A conta é cm ÷ 2,54 × dpi. As regras variam conforme o órgão, então siga sempre as instruções do site de envio."),
    ("E se aparecer que não foi possível chegar ao limite?",
     "Um tamanho pronto não pode ser reduzido, então limites muito baixos podem ser impossíveis. Aumente um pouco o limite ou escolha “Manter proporção original” para as dimensões também diminuírem."),
    ("Funciona com fotos HEIC do iPhone e PNG?",
     "JPG, PNG e WEBP sempre funcionam. O HEIC do iPhone abre no Safari, mas não em todos os navegadores; se falhar, exporte como JPG pelo app Fotos. O resultado é salvo em JPG ou WEBP."),
    ("Devo escolher JPG ou WEBP?",
     "Escolha JPG. A maioria dos formulários e sites oficiais só aceita JPG. O WEBP gera arquivos menores com a mesma qualidade, mas é aceito em menos lugares."),
    ("Dá para usar no celular?",
     "Dá. Escolha fotos da galeria, ajuste o corte com o dedo e salve o resultado direto."),
]

# ------------------------------------------------------------------ 페이지 정의
# group: 같은 내용의 언어별 페이지를 묶어 hreflang으로 연결
def kb_label(kb):
    return "1MB" if kb == 1000 else f"{kb}KB"


PAGES = {"ko": [], "en": [], "id": [], "pt": []}

# ---- 한국어
KO_KB_USE = {
    100: ("지원서, 자격증·시험 접수, 각종 신청 사이트의 사진 첨부에서 가장 흔한 제한이에요.",
          "100KB는 600×800px 안팎의 증명사진이라면 화질을 크게 해치지 않고 맞출 수 있는 경우가 많아요. 휴대폰 원본(수 MB)도 한 번에 줄어듭니다."),
    200: ("온라인 서류 제출이나 게시판 첨부처럼 조금 여유 있는 제한에서 자주 쓰여요.",
          "200KB면 대부분의 사진을 화질 걱정 없이 담을 수 있어요. 원본이 너무 큰 경우에만 해상도를 살짝 줄이고, 가능하면 크기는 그대로 유지합니다."),
}
PAGES["ko"].append(dict(
    slug="", group="main", title="사진 용량 줄이기 · 증명사진 규격 맞추기 (100KB·200KB) | 해봄",
    h1="사진 용량 줄이고, <em>여권·증명사진 규격</em>으로 자르기",
    desc="사진 용량을 20KB·50KB·100KB·200KB 등 원하는 크기 이하로 줄이고, 여권·증명사진 규격(3.5×4.5cm, 3×4cm)에 맞춰 자르세요. 회원가입·업로드 없이 브라우저에서 무료로 바로.",
    lead="접수 사이트에서 <strong>“파일 용량은 100KB 이하”</strong> 같은 안내 때문에 막혔나요? 사진을 올리고 용량만 고르면, 그 용량 <strong>이하로 가장 선명하게</strong> 줄여 드려요. 증명사진 규격으로 자르는 것도 한 번에 됩니다. 사진은 내 기기 밖으로 나가지 않아요.",
    section_title="이럴 때 쓰세요",
    section_html="<ul><li><strong>온라인 접수·지원서</strong> 사진 첨부에서 “용량 초과” 오류가 날 때</li><li><strong>증명사진·여권사진</strong>을 규격 크기(픽셀)에 맞춰야 할 때</li><li>메일·게시판에 올릴 사진이 너무 커서 <strong>용량만 줄이고 싶을 때</strong></li><li>여러 장을 <strong>한꺼번에</strong> 줄여서 ZIP으로 받고 싶을 때</li></ul>",
    data=dict(kb="0", mode="crop", preset="p3545"),
    kw="사진 용량 줄이기, 사진 용량 줄이는 법, 이미지 용량 줄이기, 사진 100KB, 사진 200KB, 증명사진 규격, 여권사진 사이즈, 사진 사이즈 변경, 사진 크기 줄이기, 사진 압축",
    crumb="사진 용량 줄이기",
))
for kb in (100,):
    lab = kb_label(kb)
    when, tip = KO_KB_USE[kb]
    PAGES["ko"].append(dict(
        slug=f"{kb}kb", group=f"{kb}kb", title=f"사진 용량 {lab} 이하로 줄이기 — 무료, 업로드 없이 | 해봄",
        h1=f"사진 용량 <em>{lab} 이하</em>로 줄이기",
        desc=f"사진 용량을 {lab} 이하로 맞춰 드려요. 사진을 올리면 {lab}를 넘지 않는 가장 선명한 화질로 바로 변환. 회원가입·서버 업로드 없이 브라우저에서 무료.",
        lead=f"사진을 올리면 <strong>{lab} 이하</strong>로 자동으로 맞춰 드려요. 해봄은 목표 용량을 넘지 않는 선에서 <strong>가장 높은 화질</strong>을 찾아 줄이고, 사진은 내 기기 밖으로 나가지 않아요.",
        section_title=f"{lab} 이하가 필요한 경우",
        section_html=f"<p>{when}</p><p>{tip}</p><p>원본이 이미 {lab}보다 작으면 화질을 건드리지 않고 그대로 돌려드려요.</p>",
        data=dict(kb=str(kb), mode="crop", preset="p3545"),
        kw=f"사진 {lab} 줄이기, 사진 용량 {lab} 이하, 이미지 {lab} 이하, 사진 용량 줄이기, 사진 압축, {lab} 사진 만들기",
        crumb=f"{lab} 이하로 줄이기",
        faq_first=(f"사진을 {lab} 이하로 줄이면 화질이 많이 떨어지나요?",
                   f"원본 크기에 따라 달라요. 해봄은 {lab}를 넘지 않는 범위에서 가장 높은 화질을 찾아 저장하고, 그래도 부족하면 필요한 만큼만 크기(픽셀)를 줄여요. 휴대폰 원본처럼 큰 사진일수록 줄이는 폭이 커서 화질 차이가 눈에 띌 수 있어요. 변환 결과는 바로 미리보기로 확인하세요."),
    ))
PAGES["ko"].append(dict(
    slug="passport", group="passport", title="여권사진 사이즈 맞추기 3.5×4.5cm (413×531px) | 해봄",
    h1="여권사진 사이즈 <em>3.5×4.5cm</em>로 자르고 용량 줄이기",
    desc="사진을 여권사진 크기 3.5×4.5cm(413×531px, 300dpi)로 잘라 주고 원하는 KB 이하로 줄여 드려요. 위치·확대를 직접 조정, 회원가입·업로드 없이 브라우저에서 무료.",
    lead="사진을 올리면 <strong>3.5×4.5cm(413×531px)</strong> 크기로 잘라 드려요. 얼굴 위치와 크기는 손으로 끌어 맞추고, <strong>용량 제한</strong>이 있다면 함께 골라 맞출 수 있어요. 사진은 내 기기 밖으로 나가지 않아요.",
    section_title="꼭 알아두세요",
    section_html="<p>이 도구는 사진의 <strong>크기와 용량</strong>을 맞춰 주는 도구예요. 얼굴 크기 비율, 배경색, 표정, 안경 같은 <strong>심사 기준은 제출처마다 달라서</strong> 자동으로 확인해 주지 않아요. 접수처의 사진 규격 안내를 먼저 확인하세요.</p><p>크기를 자른 결과 파일에는 300dpi 정보가 들어가요. 픽셀(413×531)은 3.5cm×4.5cm를 300dpi로 환산한 값입니다.</p>",
    data=dict(kb="0", mode="crop", preset="p3545"),
    kw="여권사진 사이즈, 여권사진 규격, 여권사진 3.5x4.5, 여권사진 413x531, 여권사진 용량 줄이기, 증명사진 사이즈 맞추기, 사진 자르기",
    crumb="여권사진 사이즈 맞추기",
    faq_first=("여권사진 3.5×4.5cm는 몇 픽셀인가요?",
               "300dpi 기준으로 가로 413px, 세로 531px이에요. 계산식은 cm ÷ 2.54 × dpi입니다. 제출처가 요구하는 픽셀·dpi·용량이 다르면 그 기준을 우선하세요."),
))
PAGES["ko"].append(dict(
    slug="id-photo", group="idphoto", title="증명사진 사이즈 맞추기 3×4cm (354×472px) | 해봄",
    h1="증명사진 사이즈 <em>3×4cm</em>로 자르고 용량 줄이기",
    desc="사진을 증명사진 크기 3×4cm(354×472px, 300dpi)로 잘라 주고 원하는 KB 이하로 줄여 드려요. 이력서·접수용 사진을 브라우저에서 무료로, 업로드 없이.",
    lead="사진을 올리면 <strong>3×4cm(354×472px)</strong> 크기로 잘라 드려요. 위치와 크기를 손으로 맞추고, <strong>100KB 이하</strong> 같은 용량 제한도 함께 골라 맞출 수 있어요. 사진은 내 기기 밖으로 나가지 않아요.",
    section_title="이력서·접수용 사진, 이렇게 맞추세요",
    section_html="<p>이력서나 각종 접수에서 쓰는 증명사진은 보통 <strong>3×4cm</strong> 또는 <strong>3.5×4.5cm</strong>예요. 위의 도구에서 규격을 고르고, 사진을 끌어 얼굴 위치를 맞춘 뒤 용량을 고르세요.</p><p>크기와 용량만 맞춰 주는 도구라서 얼굴 비율·배경색 같은 <strong>제출처의 심사 기준</strong>은 직접 확인해야 해요.</p>",
    data=dict(kb="0", mode="crop", preset="p34"),
    kw="증명사진 사이즈, 증명사진 규격, 증명사진 3x4, 증명사진 354x472, 이력서 사진 사이즈, 증명사진 용량 줄이기, 사진 자르기",
    crumb="증명사진 사이즈 맞추기",
    faq_first=("증명사진 3×4cm는 몇 픽셀인가요?",
               "300dpi 기준으로 가로 354px, 세로 472px이에요. 계산식은 cm ÷ 2.54 × dpi입니다. 제출처가 요구하는 픽셀·dpi·용량이 다르면 그 기준을 우선하세요."),
))

# ---- English (India, US and other English-speaking markets)
EN_KB_USE = {
    20: ("Online application forms and government portals often set a very low cap on the photo upload, sometimes around 20KB.",
         "At 20KB the photo has to be small, so the dimensions shrink along with the quality. Haebom reduces only as much as it needs to, so the face stays recognizable. Always check the exact limit in the notice for your form."),
    50: ("Exam registrations and application forms commonly ask for photos somewhere between 20KB and 50KB.",
         "A 50KB limit is tight but workable for a passport-style photo. Cropping to the size the form asks for first, then compressing, gives a sharper result than shrinking a large photo."),
    100: ("Many portals and application forms ask for a photo of 100KB or less.",
          "100KB is enough for a clear passport-style photo of roughly 600×800 px or smaller. A phone original of several MB is reduced in one step."),
}
PAGES["en"].append(dict(
    slug="", group="main", title="Resize Image to KB Online — Free Image & Photo Resizer | Haebom",
    h1="Resize an image to <em>exact KB</em> online",
    desc="Free online image resizer in KB. Resize an image to 20KB, 50KB, 100KB or any size and crop it to passport photo size. No upload, no sign-up: it works inside your browser.",
    lead="Stuck on a form that says <strong>“photo must be under 50KB”</strong>? Resize your image online: add it, pick the KB limit, and get the <strong>sharpest result that fits</strong>. Cropping to passport or ID photo size is built in. Your image never leaves your device.",
    section_title="When to use it",
    section_html="<ul><li>An <strong>application form or exam portal</strong> rejects your photo for being too large</li><li>You need a <strong>passport or ID photo</strong> at an exact pixel size</li><li>A photo is too big to email or upload and you just want to <strong>shrink the file size</strong></li><li>You want to reduce <strong>many photos at once</strong> and download them as a ZIP</li></ul>",
    data=dict(kb="0", mode="crop", preset="p3545"),
    kw="resize image kb, resize image to 50kb, resize image online, online resize image, image resize online, resize image size, kb resize, resize photo to 20kb, resize photo for application form, passport photo size, photo resizer",
    crumb="Resize Image to KB",
))
for kb in (50, 100):
    lab = kb_label(kb)
    when, tip = EN_KB_USE[kb]
    PAGES["en"].append(dict(
        slug=f"{kb}kb", group=f"{kb}kb", title=f"Resize Image to {lab} Online — Free, No Upload | Haebom",
        h1=f"Resize an image to <em>{lab} or less</em> online",
        desc=f"Resize an image to {lab} or less online in seconds. Add your photo and get the sharpest result under {lab}. Free, no sign-up, and the image never leaves your browser.",
        lead=f"Resize your image online: add it and it is fitted to <strong>{lab} or less</strong> automatically. Haebom finds the <strong>highest quality that stays under the limit</strong>, and your image never leaves your device.",
        section_title=f"When you need {lab} or less",
        section_html=f"<p>{when}</p><p>{tip}</p><p>If the original is already under {lab}, it is returned untouched.</p>",
        data=dict(kb=str(kb), mode="crop", preset="p200230" if kb in (20, 50) else "p3545"),
        kw=f"resize image to {lab.lower()}, resize image {lab.lower()} online, online resize image, image resize online, resize photo to {lab.lower()}, kb resize, resize image kb",
        crumb=f"{lab} or less",
        faq_first=(f"Will the photo look worse at {lab}?",
                   f"It depends on how large the original is. Haebom saves the highest quality that stays within {lab} and only shrinks the pixel size if it has to. The bigger the original, the more it is reduced. You can check the result in the preview before saving."),
    ))
PAGES["en"].append(dict(
    slug="passport-photo", group="passport", title="Passport Photo Size 35×45 mm / 2×2 in — Resize Online | Haebom",
    h1="Resize a photo to <em>passport size</em> and set the KB",
    desc="Resize a photo online to passport size (35×45 mm = 413×531 px, or 2×2 in = 600×600 px at 300 dpi) and set the KB limit you need. Free, no upload, works in your browser.",
    lead="Add a photo and crop it to <strong>35×45 mm (413×531 px)</strong> or <strong>2×2 in (600×600 px)</strong>. Drag to position the face, then set a <strong>file size limit</strong> if your form needs one. Your photo never leaves your device.",
    section_title="Good to know",
    section_html="<p>This tool fits the <strong>size and file size</strong> of a photo. It does not check face proportions, background color, expression or glasses; those <strong>rules differ by country and form</strong>, so read the official photo guidelines first.</p><p>Cropped JPG files are saved with 300 dpi information. 35×45 mm and 2×2 in are converted to pixels at 300 dpi.</p>",
    data=dict(kb="0", mode="crop", preset="p3545"),
    kw="passport photo size, resize passport photo online, passport size photo resize, passport photo 35x45mm, passport photo 2x2 inch, passport photo 413x531, resize image size kb, passport photo under 100kb",
    crumb="Passport photo size",
    faq_first=("What is the size of a passport photo in pixels?",
               "At 300 dpi, 35×45 mm is 413×531 px and 2×2 inches is 600×600 px. Requirements vary by country and by application, so follow the instructions of the site you are submitting to."),
))

# ---- Bahasa Indonesia
PAGES["id"].append(dict(
    slug="", group="main", title="Kecilkan Ukuran Foto ke 200KB & Pas Foto 3x4 4x6 Online | Haebom",
    h1="Kecilkan ukuran foto ke <em>KB yang pas</em>, potong jadi pas foto",
    desc="Alat gratis untuk mengecilkan ukuran foto ke 200KB atau ukuran lain dan memotongnya jadi pas foto 3x4 atau 4x6. Tanpa unggah, tanpa daftar: diproses langsung di browser.",
    lead="Terhambat syarat <strong>“foto maksimal 200KB”</strong> saat mendaftar? Masukkan foto, pilih batas ukurannya, dan dapatkan <strong>hasil paling tajam yang masih muat</strong>. Potong ke ukuran pas foto juga langsung bisa. Foto tidak keluar dari perangkat Anda.",
    section_title="Kapan dipakai",
    section_html="<ul><li>Saat <strong>pendaftaran online</strong> menolak foto karena ukuran file terlalu besar</li><li>Saat butuh <strong>pas foto</strong> dengan ukuran piksel yang tepat</li><li>Saat foto terlalu besar untuk dikirim atau diunggah dan Anda hanya ingin <strong>mengecilkan ukuran file</strong></li><li>Saat ingin mengecilkan <strong>banyak foto sekaligus</strong> dan mengunduhnya sebagai ZIP</li></ul>",
    data=dict(kb="0", mode="crop", preset="p34"),
    kw="kecilkan ukuran foto, kompres foto 200kb, perkecil foto jadi 200kb, ukuran pas foto 3x4, ukuran pas foto 4x6, pas foto cpns, memperkecil ukuran foto online",
    crumb="Perkecil Ukuran Foto",
))
PAGES["id"].append(dict(
    slug="200kb", group="200kb", title="Kecilkan Foto ke 200KB atau Kurang — Gratis, Tanpa Unggah | Haebom",
    h1="Kecilkan foto ke <em>200KB atau kurang</em>",
    desc="Kecilkan foto ke 200KB atau kurang dalam hitungan detik. Masukkan foto dan dapatkan hasil paling tajam di bawah 200KB. Gratis, tanpa daftar, foto tidak keluar dari browser.",
    lead="Masukkan foto dan ukurannya otomatis disesuaikan ke <strong>200KB atau kurang</strong>. Haebom mencari <strong>kualitas tertinggi yang masih di bawah batas</strong>, dan foto Anda tidak keluar dari perangkat.",
    section_title="Kapan perlu 200KB atau kurang",
    section_html="<p>Banyak portal pendaftaran, termasuk pendaftaran seleksi online, meminta foto dan dokumen dengan batas ukuran sekitar 200KB. Batas bisa berbeda tiap tahun dan tiap formasi, jadi cek ketentuan resmi Anda.</p><p>Potong foto ke ukuran pas foto yang diminta (misalnya 3×4 atau 4×6) terlebih dahulu, lalu atur batas ukuran file. Hasilnya lebih tajam daripada mengecilkan foto besar secara langsung.</p><p>Jika file asli sudah di bawah 200KB, file dikembalikan apa adanya.</p>",
    data=dict(kb="200", mode="crop", preset="p34"),
    kw="kecilkan foto 200kb, kompres foto 200kb, perkecil ukuran foto 200kb, foto 200kb untuk pendaftaran, cara kecilkan foto jadi 200kb",
    crumb="200KB atau kurang",
    faq_first=("Apakah foto jadi buram saat dikecilkan ke 200KB?",
               "Tergantung ukuran aslinya. Haebom menyimpan kualitas tertinggi yang masih di bawah 200KB dan hanya mengecilkan dimensi bila perlu. Semakin besar foto asli, semakin banyak yang dikurangi. Cek hasilnya di pratinjau sebelum menyimpan."),
))
PAGES["id"].append(dict(
    slug="pas-foto", group="idphoto", title="Ukuran Pas Foto 3x4 dan 4x6 — Potong & Kecilkan ke KB | Haebom",
    h1="Potong jadi <em>pas foto 3×4 atau 4×6</em> dan kecilkan ukurannya",
    desc="Potong foto ke ukuran pas foto 3×4 cm (354×472 px) atau 4×6 cm (472×709 px) dan kecilkan ke batas KB yang dibutuhkan. Gratis, tanpa unggah, langsung di browser.",
    lead="Masukkan foto lalu potong ke <strong>3×4 cm (354×472 px)</strong> atau <strong>4×6 cm (472×709 px)</strong>. Geser untuk mengatur posisi wajah, lalu atur <strong>batas ukuran file</strong> bila diperlukan. Foto tidak keluar dari perangkat Anda.",
    section_title="Perlu diketahui",
    section_html="<p>Alat ini hanya mengatur <strong>ukuran dan besar file</strong> foto. Latar belakang, proporsi wajah, dan pakaian <strong>mengikuti ketentuan masing-masing instansi</strong> dan tidak diperiksa otomatis, jadi baca panduan resmi pendaftaran Anda.</p><p>Hasil JPG dari pemotongan disimpan dengan informasi 300 dpi. Ukuran cm dikonversi ke piksel pada 300 dpi.</p>",
    data=dict(kb="0", mode="crop", preset="p34"),
    kw="ukuran pas foto 3x4, ukuran pas foto 4x6, pas foto 3x4 berapa piksel, pas foto 4x6 piksel, potong pas foto online, pas foto cpns",
    crumb="Ukuran pas foto",
    faq_first=("Berapa piksel pas foto 3×4 dan 4×6?",
               "Pada 300 dpi, 3×4 cm = 354×472 px dan 4×6 cm = 472×709 px. Rumusnya cm ÷ 2,54 × dpi. Jika instansi meminta piksel atau dpi lain, ikuti ketentuan mereka."),
))

# ---- Português (Brasil)
PAGES["pt"].append(dict(
    slug="", group="main", title="Reduzir Tamanho da Foto em KB e Foto 3x4 Online | Haebom",
    h1="Reduza a foto para <em>o tamanho em KB</em> que você precisa e corte em 3x4",
    desc="Ferramenta grátis para reduzir o tamanho da foto para 100KB, 200KB ou outro limite e cortar em 3x4 ou no tamanho de passaporte. Sem upload, sem cadastro: funciona no navegador.",
    lead="Travou porque o site pede <strong>“foto de até 200KB”</strong>? Adicione a foto, escolha o limite e receba o <strong>resultado mais nítido que cabe</strong>. Cortar em 3x4 ou no tamanho de passaporte também já vem pronto. Sua foto não sai do seu aparelho.",
    section_title="Quando usar",
    section_html="<ul><li>Quando uma <strong>inscrição ou cadastro online</strong> recusa a foto por ser grande demais</li><li>Quando você precisa de uma <strong>foto 3x4 ou de documento</strong> com tamanho exato em pixels</li><li>Quando a foto é grande demais para enviar e você só quer <strong>reduzir o tamanho do arquivo</strong></li><li>Quando quer reduzir <strong>várias fotos de uma vez</strong> e baixar em ZIP</li></ul>",
    data=dict(kb="0", mode="crop", preset="p34"),
    kw="reduzir tamanho da foto, diminuir foto para 100kb, diminuir foto 200kb, foto 3x4 online, foto 3x4 em pixels, foto de passaporte 5x7, redimensionar foto",
    crumb="Reduzir tamanho da foto",
))
PAGES["pt"].append(dict(
    slug="foto-3x4", group="idphoto", title="Foto 3x4 Online — Cortar e Reduzir para KB | Haebom",
    h1="Corte a foto em <em>3x4</em> e reduza o tamanho do arquivo",
    desc="Corte sua foto no tamanho 3x4 cm (354×472 px a 300 dpi) ou 5x7 cm de passaporte e reduza para o limite de KB que o site pede. Grátis, sem upload, direto no navegador.",
    lead="Adicione a foto e corte em <strong>3×4 cm (354×472 px)</strong> ou <strong>5×7 cm (591×827 px)</strong>. Arraste para posicionar o rosto e defina um <strong>limite de tamanho</strong> se precisar. Sua foto não sai do seu aparelho.",
    section_title="Bom saber",
    section_html="<p>Esta ferramenta ajusta o <strong>tamanho e o peso</strong> da foto. Fundo, proporção do rosto e vestuário <strong>seguem as regras de cada órgão</strong> e não são verificados automaticamente, então leia as orientações oficiais do seu envio.</p><p>O JPG cortado é salvo com informação de 300 dpi. Os tamanhos em cm são convertidos para pixels a 300 dpi.</p>",
    data=dict(kb="0", mode="crop", preset="p34"),
    kw="foto 3x4 online, foto 3x4 quantos pixels, cortar foto 3x4, foto 3x4 para concurso, foto passaporte 5x7, reduzir foto 3x4 para kb",
    crumb="Foto 3x4",
    faq_first=("Quantos pixels tem uma foto 3x4?",
               "A 300 dpi, 3×4 cm tem 354×472 px. A conta é cm ÷ 2,54 × dpi. Se o site pedir outros pixels ou dpi, siga a regra dele."),
))
