﻿
	// 对话相关的属性======================================================
 	RPG.talkScript= null;
 	// 选择
	RPG.choiseScript= null;
	//对话序号
 	RPG.talkIndex = 0;
 	// 对话换行位置记录
 	RPG.talkLinePos= 550;
 	// 对话窗口大小
 	RPG.TALKLEFT= 10;
 	RPG.TALKWIDTH= WIDTH- RPG.TALKLEFT* 2;
 	RPG.TALKHEIGHT= 100;
 	RPG.TALKTOP= HEIGHT- RPG.TALKHEIGHT- RPG.TALKLEFT;
 	// 一句话说完有标记
 	RPG.sentenceFinish= true;


let Talk = {
    msgCurrent,
    msgText,

    makeChoice:(optionScript)=>{
        //如果对话内容为空，则开始判断是否可以对话
        if (!RPG.choiseScript){
            RPG.choiseScript = optionScript;
            if(RPG.choiseScript == null) return;
        }
        // 状态切换
        RPG.pushState(RPG.IN_CHOOSING);
        //得到对话内容
        //将对话层清空
        talkLayer.removeAllChild();
        //对话背景
        UI.drawBorderWindow(talkLayer, RPG.TALKLEFT, RPG.TALKTOP, RPG.TALKWIDTH, RPG.TALKHEIGHT);
        //对话头像
        if (optionScript.img) {
            let bitmapData = new LBitmapData(imglist[optionScript.img]);
            let bitmap = new LBitmap(bitmapData);
            bitmap.x = optionScript.x || RPG.TALKLEFT;
            bitmap.y = optionScript.y || RPG.TALKTOP-bitmap.height;
            talkLayer.addChild(bitmap);
        }
        //对话人物名称
        if (optionScript.msg!=""){
            let name = new LTextField();
            name.x = RPG.TALKLEFT+ 5;
            name.y = RPG.TALKTOP+ 5;
            name.size = "15";
            name.color = "#FFF";
            name.text = optionScript.msg;
            talkLayer.addChild(name);
            // 对话初始行的位置
            RPG.talkLinePos= name.y+ 20;
        } else {
            RPG.talkLinePos= RPG.TALKTOP+ 5;
        }

        //分支选项
        for (let i= 0; i< optionScript.choise.length; i++){
            let button01= RPG.newSimpleButton(RPG.TALKWIDTH- 10, 22, RPG.TALKLEFT+ 5, RPG.talkLinePos, optionScript.choise[i].text, optionScript.choise[i].action);
            talkLayer.addChild(button01);
            RPG.talkLinePos= RPG.talkLinePos+ 25;
        }
        talkLayer.x = 0;
        talkLayer.y = 0;
    },
    waitTalk:(callback)=>{
        if (RPG.talkScript) {
            setTimeout(function(){Talk.waitTalk(callback)}, 500);
        } else {
            if (callback) callback();
        }
    },
    closeTalk:()=>{
        RPG.popState();
        //将对话层清空
        talkLayer.removeAllChild();
        //对话结束
        RPG.talkScript = null;
        RPG.choiseScript = null;
        // RPG.ScriptIndex++;
        isKeyDown= false;
    },

	/**
	 * 对话内容逐字显示
	 */
    closeSentence:()=>{
        sentenceFinish = true;
    },

    /**
     * 设置对话框位置
     */
    setTalkPos:(pos)=>{
        if (pos==="middle"){
            RPG.TALKLEFT= 10;
            RPG.TALKWIDTH= WIDTH- RPG.TALKLEFT* 2;
            RPG.TALKHEIGHT= 100;
            RPG.TALKTOP= (HEIGHT- RPG.TALKHEIGHT)/ 2;
        } else if (pos==="bottom"){
            RPG.TALKLEFT= 10;
            RPG.TALKWIDTH= WIDTH - RPG.TALKLEFT* 2;
            RPG.TALKHEIGHT= 100;
            RPG.TALKTOP= HEIGHT - RPG.TALKHEIGHT- RPG.TALKLEFT;
        }
    },

    /**
     * 开始对话
     */
    startTalk:(talkList)=>{
        let border = 10;
        //如果对话内容为空，则开始判断是否可以对话
        if (!RPG.talkScript){
            RPG.talkScript = talkList;
            RPG.talkIndex = 0;
            if(!talkList) return;
        }
        // 状态切换
        if (!RPG.checkState(RPG.IN_TALKING)) {
            RPG.pushState(RPG.IN_TALKING);
        }
        // 前半句话没说完的情况下，先说完
        if (!RPG.sentenceFinish) {
            RPG.sentenceFinish= true;
            Talk.msgCurrent.windRunning= false;
            Talk.msgCurrent.text= Talk.msgText;
            return;
        }
        //当对话开始，且按照顺序进行对话
        if(RPG.talkIndex < RPG.talkScript.length){
            //得到对话内容
            let talkObject = RPG.talkScript[RPG.talkIndex];

            //将对话层清空
            talkLayer.removeAllChild();
            //对话背景
            UI.drawBorderWindow(talkLayer, RPG.TALKLEFT, RPG.TALKTOP, RPG.TALKWIDTH, RPG.TALKHEIGHT);
            //对话头像
            if (talkObject.img) {
                let imgData = new LBitmapData(imglist[talkObject.img]);
                let bitmap = new LBitmap(imgData);
                bitmap.scaleX = 0.5;
                bitmap.scaleY = 0.5;
                bitmap.x = talkObject.x || RPG.TALKLEFT;
                bitmap.y = talkObject.y || RPG.TALKTOP-bitmap.height/2;
                talkLayer.addChild(bitmap);
            }
            //对话人物名称
            if (talkObject.name){
                let name = UI.text(`【${talkObject.name}】`,RPG.TALKLEFT + border,RPG.TALKTOP + border);
                talkLayer.addChild(name);
                // 对话初始行的位置
                RPG.talkLinePos= name.y + 20;
            } else {
                RPG.talkLinePos = RPG.TALKTOP + border;
            }
            //对话内容
            let msg = UI.text(talkObject.msg,RPG.TALKLEFT + border,RPG.talkLinePos);
            msg.width = RPG.TALKWIDTH - border*2;
            msg.setWordWrap(true, 20);
            talkLayer.addChild(msg);
            msg.speed = 1;
            //对话内容逐字显示
            msg.wind(Talk.closeSentence);
            RPG.sentenceFinish= false;
            Talk.msgCurrent = msg;
            Talk.msgText = talkObject.msg;
            talkLayer.x = 0;
            talkLayer.y = 0;
            RPG.talkIndex++;
            RPG.talkLinePos = RPG.talkLinePos + 20;
        }else{
            Talk.closeTalk();
        }
    },

    /**
     * 添加对话
     */
    addTalk:()=>{
        // 仅在地图控制状态可以启动新对话
        if (RPG.checkState(RPG.MAP_CONTROL) && player){
            let tx = player.px,ty = player.py;
            switch (player.direction){
                case UP:
                    ty -= 1;
                    break;
                case LEFT:
                    tx -= 1;
                    break;
                case RIGHT:
                    tx += 1;
                    break;
                case DOWN:
                    ty += 1;
                    break;
            }
            for(let key in charaLayer.childList){
                // 不可见的对象，不触发
                if (!charaLayer.childList[key].visible) continue;
                //判断前面有npc，有则开始对话
                if (charaLayer.childList[key].px === tx && charaLayer.childList[key].py === ty){
                    if (charaLayer.childList[key].rpgEvent) {
                        // 首先转身
                        charaLayer.childList[key].anime.setAction(3- player.direction);
                        charaLayer.childList[key].anime.onframe();
                        // 然后执行指令
                        charaLayer.childList[key].rpgEvent(charaLayer.childList[key]);
                    }
                }
            }
            //如果前方没有npc，则检查跳转的可能
            if(!RPG.talkScript) {
                checkTrigger();
                return;
            }
        } else{
            // 直接继续对话
            Talk.startTalk(RPG.talkScript);
        }
    }
};
