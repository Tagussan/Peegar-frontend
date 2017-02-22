'use strict';

function parse_tree(block){
    if(!block){
        return;
    }
    console.log(block.type);
    var inputs = block.inputList;
    if(inputs){
        for(var i = 0; i < inputs.length; i++){
            console.log(inputs[i].name);
            parse_tree(block.getInputTargetBlock(inputs[i].name));
        }
    }
    var nextconn = block.nextConnection;
    if(nextconn){
        parse_tree(nextconn.targetBlock());
    }
}

var AstNode = function(type){
    this.childNode = {};
    this.type = type;
    this.fields = {};
    this.field = "";
    this.value = 0;
};

function generate_tree(block){
    if(!block){
        return null;
    }
    var node = new AstNode(block.type);
    var inputs = block.inputList;
    if(inputs){
        for(var i = 0; i < inputs.length; i++){
            var input = inputs[i];
            var childnode = generate_tree(block.getInputTargetBlock(input.name));
            if(childnode){
                node.childNode[input.name] = childnode;
            }
        }
    }
    var fieldKind = ["NUM", "MODE", "OP", "FLOW", "WHERE", "TEXT", "VAR", "STATE", "GROUP", "PORTNUM", "IOTYPE"];
    for(var i = 0; i < fieldKind.length; i++){
        var fieldValue = block.getFieldValue(fieldKind[i]);
        if(fieldValue){
            node.fields[fieldKind[i]] = fieldValue;
            node.field = fieldKind[i];
            node.value = fieldValue;
        }
        //use fieldKind node.field and node.value for simple blocks
    }
    var nextConn = block.nextConnection;
    if(nextConn){
        var next = generate_tree(nextConn.targetBlock());
        if(next){
            node.childNode["NEXT"] = next;
        }
    }
    return node;
};

Array.prototype.flatten = function() {
      return Array.prototype.concat.apply([], this);
};

Array.prototype.last = function() {
    return this[this.length-1];
};

Array.prototype.merge = function(arr){
    Array.prototype.push.apply(this, arr);
};

//register definition
var REG_null = 0, REG_pc = 1, REG_sp = 2, REG_base = 3, REG_lr = 4;

//context:
//->var_list["var_name"]
function generate_reserve_local(context){
    var instructions = [];
    var var_list = context.var_local;
    for(var i = 0; i < var_list.length;i++){
        instructions.push(["push", 0]);
    }
    //push old base
    instructions.push(["load", REG_base]);
    //calc new base
    instructions.push(["load", REG_sp]);
    instructions.push(["push", var_list.length + 1]); //base address plus offset
    instructions.push(["sub"]);
    //update base
    instructions.push(["str", REG_base]);
    return instructions;
}

function generate_free_local(context){
    var instructions = []; 
    var var_list = context.var_local;
    for(var i = 0; i < var_list.length;i++){
        instructions.push(["str", REG_null]);
    }
    //restore base
    instructions.push(["str", REG_base]);
    return instructions;
}

function find_local_var_index(context, name){
    var var_list = context.var_local;
    for(var i = var_list.length - 1; i >= 0; i--){
        if(var_list[i] == name){
            return i;
        }
    }
    console.log("no such variable:" + name);
    return -1;
}

function declare_local(context, id){
    //if a variable is already declared, do nothing
    var var_list = context.var_local;
    for(var i = var_list.length - 1; i >= 0; i--){
        if(var_list[i] == name){
            return;
        }
    }
    context.var_local.push(id);
}

AstNode.prototype.compile_func = function(context){
    var local_context = context;
    local_context.var_list = [];
    var main_proc = this.compile(local_context);
    var instructions = [];
    instructions.merge(generate_reserve_local(local_context));
    instructions.merge(main_proc);
    instructions.merge(generate_free_local(local_context));
    return instructions;
}

var stack_last_type = ""; //use for print function(type switch)

AstNode.prototype.compile = function(context){
    console.log("compiling: " + this.type);
    var instructions = [];
    if(this.type == "controls_if"){
        var instruction_blocks = [];
        var if_count = 0;
        for(var i = 0; i < Object.keys(this.childNode).length; i++){
            if(this.childNode["IF" + i]){
                if_count++;
                instruction_blocks["IF" + i] = this.childNode["IF" + i].compile(context);
                instruction_blocks["DO" + i] = this.childNode["DO" + i].compile(context);
            }
        }
        var has_else = false;
        if(this.childNode["ELSE"]){
            instruction_blocks["ELSE"] = this.childNode["ELSE"].compile(context);
            has_else = true;
        }
        //assemble codes for if-do
        for(var i = 0; i < if_count; i++){
            var condition_block = instruction_blocks["IF" + i];
            var do_block = instruction_blocks["DO" + i];
            var else_block = instruction_blocks["ELSE"];
            if(!do_block){
                do_block = [];
            }
            if(!else_block){
                else_block = [];
            }
            instructions.merge(condition_block);//add IF(condition)
            //add jump inst for next condition
            instructions.push(["incpc_if_zero", do_block.length + 1]);
            //add do block
            instructions.merge(do_block);
            //calc remainig steps to go out of this IF block
            var remainig_step = 0;
            for(var j = i + 1; j < if_count; j++){
                if(instruction_blocks["IF" + j]){
                    remainig_step += instruction_blocks["IF" + j].length + 1; //add one step for jump
                }
                if(instruction_blocks["DO" + j]){
                    remainig_step += instruction_blocks["DO" + j].length + 1;
                }
            }
            if(instruction_blocks["ELSE"]){
                remainig_step += instruction_blocks["ELSE"].length;
            }
            //add jump inst to skip other blocks
            instructions.push(["incpc", remainig_step]);
        }

        //assemble codes for else
        instructions.merge(instruction_blocks["ELSE"]);

        //instructions.merge(instruction_blocks.flatten());//for debug
    }else if(this.type == "controls_repeat_forever"){
        var do_block = this.childNode["DO"].compile(context);
        var postproc_block = [];
        postproc_block.push(["decpc", do_block.length + 1]);
        instructions.merge(do_block);
        instructions.merge(postproc_block);

    }else if(this.type == "controls_repeat_ext"){
        var times_block = this.childNode["TIMES"].compile(context);
        var do_block = this.childNode["DO"].compile(context);
        declare_local(context, "controls_repeat_ext");
        var itr_idx = find_local_var_index(context, "controls_repeat_ext");

        //postprocess 
        var postproc_block = []
        //increment counter
        postproc_block.push(["load_local", itr_idx]);
        postproc_block.push(["push", 1]);
        postproc_block.push(["add"]);
        postproc_block.push(["str_local", itr_idx]);

        //generate condition instructions
        var condition_block = [];
        condition_block.merge(times_block);
        condition_block.push(["load_local", itr_idx]);
        condition_block.push(["sub"]);
        condition_block.push(["incpc_if_zero", do_block.length + postproc_block.length + 1]); //add 1 for decpc

        //return to condition
        postproc_block.push(["decpc", condition_block.length + do_block.length + postproc_block.length + 1]); //add 1 for this-instruction-self

        instructions.merge(condition_block);
        instructions.merge(do_block);
        instructions.merge(postproc_block);
    }else if(this.type == "controls_for"){
        var by_block = this.childNode["BY"].compile(context);
        var from_block = this.childNode["FROM"].compile(context);
        var to_block = this.childNode["TO"].compile(context);
        //first declare local
        var var_name = this.value;
        declare_local(context, var_name);
        var itr_idx = find_local_var_index(context, var_name);
        //then compile do
        var do_block = this.childNode["DO"].compile(context);

        //init variable
        instructions.merge(from_block);
        instructions.push(["str_local", itr_idx]);

        //postprocess 
        var postproc_block = [];
        //process counter
        postproc_block.push(["load_local", itr_idx]);
        postproc_block.merge(by_block);
        postproc_block.push(["add"]);
        postproc_block.push(["str_local", itr_idx]);

        //generate condition instructions
        var condition_block = [];
        condition_block.push(["load_local", itr_idx]);
        condition_block.merge(to_block);
        condition_block.push(["le"]);
        condition_block.push(["incpc_if_zero", do_block.length + postproc_block.length + 1]); //add 1 for decpc

        //return to condition
        postproc_block.push(["decpc", condition_block.length + do_block.length + postproc_block.length + 1]); //add 1 for this-instruction-self

        instructions.merge(condition_block);
        instructions.merge(do_block);
        instructions.merge(postproc_block);
    }else if(this.type == "logic_compare"){
        instructions.merge(this.childNode["B"].compile(context));
        instructions.merge(this.childNode["A"].compile(context));
        if(this.value == "EQ"){
            instructions.push(["eq"]);    
        }else if(this.value == "NEQ"){
            instructions.push(["neq"]);
        }else if(this.value == "LT"){
            instructions.push(["lt"]);
        }else if(this.value == "GT"){
            instructions.push(["gt"]);
        }else if(this.value == "LTE"){
            instructions.push(["lte"]);
        }else if(this.value == "GTE"){
            instructions.push(["gte"]);
        }
    }else if(this.type == "logic_operation"){
        instructions.merge(this.childNode["B"].compile(context));
        instructions.merge(this.childNode["A"].compile(context));
        if(this.value == "AND"){
            instructions.push(["and"]);
        }else if(this.value == "OR"){
            instructions.push(["or"]);    
        }
    }else if(this.type == "logic_negate"){
        instructions.push(["not"]);
    }else if(this.type == "math_arithmetic"){
        instructions.merge(this.childNode["B"].compile(context));
        instructions.merge(this.childNode["A"].compile(context));
        if(this.value == "MULTIPLY"){
            instructions.push(["mul"]);
        }else if(this.value == "ADD"){
            instructions.push(["add"]);
        }else if(this.value == "MINUS"){
            instructions.push(["sub"]);
        }else if(this.value == "DIVIDE"){
            instructions.push(["div"]);
        }
    }else if(this.type == "math_modulo"){
        instructions.merge(this.childNode["DIVIDEND"].compile(context));
        instructions.merge(this.childNode["DIVISOR"].compile(context));
        instructions.push(["mod"]);
    }else if(this.type == "math_random_int"){
        instructions.merge(this.childNode["TO"].compile(context));
        instructions.merge(this.childNode["FROM"].compile(context));
        instructions.push(["rand"]);
    }else if(this.type == "math_number"){
        if(this.field == "NUM"){
            instructions.push(["push", Number(this.value)]);
        }
    }else if(this.type == "variables_get"){
        var var_name = this.value;
        var itr_idx = find_local_var_index(context, var_name);
        instructions.push(["load_local", itr_idx]);
        stack_last_type = "int";

    }else if(this.type == "variables_set"){
        var var_name = this.value;
        declare_local(context, var_name);
        var itr_idx = find_local_var_index(context, var_name);

        instructions.merge(this.childNode["VALUE"].compile(context));
        instructions.push(["str_local", itr_idx])

    }else if(this.type == "user_port_output"){
        //this section has to be re-written as port definition changes
        var fields = this.fields;
        var port_index = 0;
        if(fields.GROUP == "GROUPA"){
            if(fields.PORTNUM == "ONBOARD"){
                port_index = 1;
            }else{
                port_index = Number(fields.PORTNUM) - 1 + 4;
            }
        }else if(fields.GROUP == "GROUPB"){
            if(fields.PORTNUM == "ONBOARD"){
                port_index = 3;
            }else{
                port_index = Number(fields.PORTNUM) - 1 + 12;
            }
        }
        instructions.merge(this.childNode["VAL"].compile(context));
        instructions.push(["str_port", port_index]);
    }else if(this.type == "user_port_input"){
        //this section has to be re-written as port definition changes
        var fields = this.fields;
        var port_index = 0;
        if(fields.GROUP == "GROUPA"){
            if(fields.PORTNUM == "ONBOARD"){
                port_index = 0;
            }else{
                port_index = Number(fields.PORTNUM) - 1 + 4;
            }
        }else if(fields.GROUP == "GROUPB"){
            if(fields.PORTNUM == "ONBOARD"){
                port_index = 2;
            }else{
                port_index = Number(fields.PORTNUM) - 1 + 12;
            }
        }
        instructions.push(["load_port", port_index]);
    }else if(this.type == "wait_sec"){
        instructions.merge(this.childNode["VAL"].compile(context));
        instructions.push(["wait_sec"])
    }else if(this.type == "wait_millisec"){
        instructions.merge(this.childNode["VAL"].compile(context));
        instructions.push(["wait_millisec"])

    }else if(this.type == "text_print"){
        //text things are for debug only
        instructions.merge(this.childNode["TEXT"].compile(context));
        instructions.push(["print_int"]);
    }else if(this.type == "text"){
        instructions.push(["print_str", this.value]);
        stack_last_type = "str";
    }else {
        console.log("Unknown block type: " + this.type);
    }
    if(this.childNode["NEXT"]){
        instructions.merge(this.childNode["NEXT"].compile(context));
    }
    return instructions;
}

var assemblyTable = {
    push: 0,
    str: 1,
    load: 2,
    str_local: 3,
    load_local: 4,
    incpc_if_zero: 5,
    incpc: 6,
    decpc: 7,
    eq: 8,
    neq: 9,
    lt: 10,
    le: 11,
    gt: 12,
    ge: 13,
    mul: 14,
    sub: 15,
    add: 16,
    div: 17,
    mod: 18,
    eq_i: 19,
    neq_i: 20,
    lt_i: 21,
    le_i: 22,
    gt_i: 23,
    ge_i: 24,
    mul_i: 25,
    sub_i: 26,
    add_i: 27,
    div_i: 28,
    mod_i: 29,
    and: 30,
    or: 31,
    not: 32,
    rand: 33,
    wait_sec: 34,
    wait_millisec: 35,

    initp_din_raw: 100,
    initp_din_slow: 101,
    initp_dout: 102,
    initp_ain: 103,
    initp_aout: 104,

    str_port: 105,
    load_port: 106,

    packet_start: 253,
    packet_end: 254,
    print_int: 255
};

function printAssembly(assembly){
    var str = "";
    for(var i = 0; i< assembly.length; i++){
        if(assembly[i][1] != null){
            str += assembly[i][0] + " " + assembly[i][1] + "\n";
        }else{
            str += assembly[i][0] + " " + "." + "\n";
        }
    }
    console.log(str);
}

function assemble(assembly){
    var machineCode = [];
    for(var i = 0; i < assembly.length; i++){
        if(assembly[i][1] != null){
	    machineCode.push(assemblyTable[assembly[i][0]]);
	    machineCode.push(assembly[i][1]);
        }else{
	    machineCode.push(assemblyTable[assembly[i][0]]);
        }
    }
    return machineCode;
}

function generatePortSettingInstructions(){
    var settings = getPortSettings();
    var result = [];
    for(var i = 0; i < settings.length; i++){
        if(settings[i] == "DInRaw"){
            result.push(["initp_din_raw", i]);
        }else if(settings[i] == "DInSlow"){
            result.push(["initp_din_slow", i]);
        }else if(settings[i] == "DOut"){
            result.push(["initp_dout", i]);
        }else if(settings[i] == "AIn"){
            result.push(["initp_ain", i]);
        }else if(settings[i] == "AOut"){
            result.push(["initp_aout", i]);
        }
    }
    return result;
}

function compileWorkspace(){
  if(Peegar.workspace.getTopBlocks().length == 0){
    showErrModal("Compile error", "<p>No block to compile.</p>");
    return;
  }
  if(Peegar.workspace.getTopBlocks().length != 1){
    showErrModal("Compile error", "<p>There are code fraction</p>");
    return;
  }
    var topBlock = Peegar.workspace.getTopBlocks()[0];

    //top block is main
    var tree = generate_tree(topBlock);
    console.log(tree);

    var context = {var_global:[], var_local:[]};
    console.log("compiling function: main");
    var assembly = tree.compile_func(context);

    //insert port setting to front
    var portsetting = generatePortSettingInstructions();
    assembly = portsetting.concat(assembly);

    console.log(assembly);
    printAssembly(assembly);//for debug

    //add header and footer
    //for(var i = 0; i < 100; i++){
    //    assembly.push(["packet_end"]);
    //}
    //for(var i = 0; i < 3; i++){
    //    assembly.unshift(["packet_start"]);
    //}

    var bin = assemble(assembly);

    var cstyleBin = "{";
    for(var i = 0; i < bin.length; i++){
        cstyleBin += bin[i].toString() + ", ";
    }
    cstyleBin += "}";
    console.log(cstyleBin);
    var wave = modulateBinary(bin);
    prepareWriting(wave);
}

