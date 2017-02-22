
/*
 * [参考]
 * http://www.kk.iij4u.or.jp/~kondo/wave/
 * http://www.hakodate-ct.ac.jp/~tokai/tokai/research/drill/wav.html
 * http://wisdom.sakura.ne.jp/system/winapi/media/mm10.html
 */

// バイト配列に文字列を書き込む
function writeString(bytes, val, offset) {
    for (var i = 0, l = val.length; i < l; i++) {
        bytes[offset + i] = val.charCodeAt(i);
    }
}

// バイト配列に 32-bit 整数を書き込む
function writeInt32(bytes, val, offset) {
    bytes[offset] = val & 255;
    val >>>= 8;
    bytes[offset + 1] = val & 255;
    val >>>= 8;
    bytes[offset + 2] = val & 255;
    val >>>= 8;
    bytes[offset + 3] = val & 255;
}

// バイト配列に 16-bit 整数を書き込む
function writeInt16(bytes, val, offset) {
    bytes[offset] = val & 255;
    val >>>= 8;
    bytes[offset + 1] = val & 255;
}

function generateWaveUri(signal, size){
    // --------------------------------------------------------------------------
    //var size = 88200;        // データサイズ (byte)
    var channel = 1;         // チャンネル数 (1:モノラル or 2:ステレオ)
    var bytesPerSec = 44100; // サンプリングレート
    var bitsPerSample = 16;  // サンプルあたりのビット数 (8 or 16)

    var offset = 44;         // ヘッダ部分のサイズ

    // バイト配列を作成
    var bytes = new Uint8Array(offset + size * 2);

    // ヘッダ書き込み
    writeString(bytes, 'RIFF', 0);                 // RIFF ヘッダ
    writeInt32(bytes, offset + size * 2 - 8, 4);       // ファイルサイズ - 8
    writeString(bytes, 'WAVE', 8);                 // WAVE ヘッダ
    writeString(bytes, 'fmt ', 12);                // fmt チャンク
    writeInt32(bytes, 16, 16);                     // fmt チャンクのバイト数
    writeInt16(bytes, 1, 20);                      // フォーマットID
    writeInt16(bytes, channel, 22);                // チャンネル数
    writeInt32(bytes, bytesPerSec, 24);            // サンプリングレート
    writeInt32(bytes, bytesPerSec * (bitsPerSample >>> 3) * channel, 28); // データ速度
    writeInt16(bytes, (bitsPerSample >>> 3) * channel, 32); // ブロックサイズ
    writeInt16(bytes, bitsPerSample, 34);          // サンプルあたりのビット数
    writeString(bytes, 'data', 36);                // data チャンク
    writeInt32(bytes, size * 2, 40);                   // 波形データのバイト数

    //amplitude of wav
    var amplitude = 32765;

    // 波形データ書き込み (サイン波)
    var idx = 0;
    for (var i = 0; i < size * 2; i += 2) {
        writeInt16(bytes, signal[idx] * amplitude , offset + i);
        idx++;
    }

    // バイト配列を文字列に変換
    var temp = '';
    for (var i = 0; i < bytes.length; i++) {
        temp += String.fromCharCode(bytes[i]);
    }

    // 文字列を Data URI に変換
    var datauri = 'data:audio/wav;base64,' + btoa(temp);
    return datauri;
}
