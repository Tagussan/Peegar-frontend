Number.prototype.split_base = function(b, p){
    var ans = [];
    var base = 1;
    for(var i = 0; i < p - 1; i++){
        base = base * b;
    }
    var tmp = this;
    for(var i = 0; i < p; i++){
        var quot = Math.floor(tmp / base);
        var rem = tmp % base;
        ans.push(quot);
        base = base / b;
        tmp = rem;
    }
    return ans;
};

//generate big-endian byte array
Number.prototype.to_bytes = function(p){
    return this.split_base(8, p);
};

Number.prototype.to_bits = function(p){
    return this.split_base(2, p);
};

var code = [-1, 1, 1, 1, 1, -1, 1, -1, 1, -1, -1, -1, 1, -1, -1, 1, 1, 1, -1, -1, -1, -1, -1, 1, 1, -1, -1, 1, -1, 1, 1];
function getAmpedCode(ampl){
    var ans = [];
    for(var i = 0; i < code.length; i++){
        ans.push((code[i] * ampl + Math.abs(ampl)) / 2);
    }
    return ans;
}

function modulateBinary(payload){
    //byte sequence
    var byte_seq = [];

    //stuff dummy data
    for(var i = 0; i < 64; i++){
        byte_seq.push(255);
    }

    //generate header
    var data_len_bytes = payload.length.to_bytes(4);
    for(var i = 0; i < data_len_bytes.length; i++){
        byte_seq.push(128 + 1);
        byte_seq.push(data_len_bytes[i]);
    }

    //payload
    byte_seq = byte_seq.concat(payload);

    //stuff dummy data
    for(var i = 0; i < 64; i++){
        byte_seq.push(255);
    }

    //bit sequence
    var bit_seq = [];
    for(var i = 0; i < byte_seq.length; i++){
        //MSB first
        var bits = byte_seq[i].to_bits(8);
        bit_seq = bit_seq.concat(bits);
    }

    //wave
    var wave = [];
    
    //stuff dummy wave
    //var head_dummy_length = 3;
    //for(var i = 0; i < head_dummy_length; i++){
    //    wave = wave.concat([0.1, 0]);
    //}
    
    for(var i = 0; i < bit_seq.length; i++){
        var ampl = 1.0;
        if(bit_seq[i] == 0){
            wave = wave.concat(getAmpedCode(ampl));
        }else if(bit_seq[i] == 1){
            wave = wave.concat(getAmpedCode(-ampl));
        }
    } 

    //stuff dummy wave
    //var tail_dummy_length = 100;
    //for(var i = 0; i < tail_dummy_length; i++){
    //    Array.prototype.push.apply(wave, [0.1, 0, 0, 0, 0.1, 0 ,0, 0]);
    //}

    return wave;
}

function prepareWriting(wave){
    var datauri = generateWaveUri(wave, wave.length);
    var audio = $('<audio>');
    audio.attr("controls", true);
    audio.attr("src", datauri);
    audio.css("display", "block");
    showModal("Successful!", audio);
}
