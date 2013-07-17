var hqUtils = {
    gDynamics: {
        gDivID: 0,
    },
    ContextMenu: function  (options) {
        var settings = {
            parent:   null, // parent element ( not for body, but context menu owner (Button pointer)
            elemName: null, // the div name can be preset
        };
        var _internals = {
            elements:  new Array (),
            timer:     null,
            isVisible: false,
            jelement:  null, 
        };
        //possible options
        // parent
        this.settings   = $.extend (settings, options);
        this._internals = _internals;
        if (this.settings.elemName == null)
            this.settings.elemName=  "menu" + (hqUtils.gDynamics.gDivID++);		

        this.Create = function ()
        {
            if (this._internals.jelement != null) return;

            this.element   = document.getElementById (this.settings.elemName);
            if (!this.element)
            {
                var $newdiv1 = $('<div id="'+this.settings.elemName+'"></div>');
                $('body').append ($newdiv1);
                this.element = document.getElementById (this.settings.elemName);
            }
            this._internals.jelement    = $('#'+this.settings.elemName);
            this._internals.jelement.addClass ("menuPopup").addClass ("h-no-select").hide();
            
            this._internals.jelement.bind ("mouseleave", {msg: this}, function (event)
            {
                event.data.msg.settings.timer = setTimeout (function () {
                    if (hqWidgets.gDynamics.gActiveMenu) {hqWidgets.gDynamics.gActiveMenu.Show (false); hqWidgets.gDynamics.gActiveMenu = null;}}
                , 5000);
            });	
            this._internals.jelement.bind ("mouseenter", {msg: this}, function (event)
            {
                if (event.data.msg.settings.timer)
                {
                    clearTimeout (event.data.msg.settings.timer);
                    event.data.msg.settings.timer = null;
                }
            });		
        }
                    
        this.Add = function (options)
        {
            //possible options
            // text
            // action
            // line	
            var obj=new Object();
            obj.isLine=(options.line) ? options.line : false;
            if (!obj.isLine)
            {
                obj.text  =(options.text)   ? hqWidgets.Translate(options.text) : "";
                obj.action=(options.action) ? options.action : null;
            }
            this._internals.elements[this._internals.elements.length] = obj;
        }
        // Remove untranslated name
        this.Remove = function (name)
        {
            var newArray = new Array();
            var i;
            var j = 0;
            name = hqWidgets.Translate(name);
            for (i=0; i< this._internals.elements.length;i++)
                if (name != this._internals.elements[i].text)
                    newArray[j++] = this._internals.elements[i];
            this.element = newArray;
        }
        this.Clear = function ()
        {
            this._internals.elements = new Array();
            if (this._internals.jelement) 
                this._internals.jelement.html("");
        }
        this.Build = function ()
        {
            this.Create ();
            this._internals.jelement.html("");
            this._internals.jelement.show();
            var i;
            var y = 0;
            var _width = 50;
            // Find max width
            for (i = 0; i < this._internals.elements.length; i++)
            {
                if (this._internals.elements[i].text) 
                {
                    var ww = this._internals.elements[i].text.width('14px,	"Tahoma", sans-serif');
                    if (ww > _width) _width = ww;
                }
            }
            _width += 20;

            for (i = 0; i < this._internals.elements.length; i++)
            {
                this._internals.jelement.append ('<div id="'+this.settings.elemName+'_'+i+'"></div>');
                var elem = $('#'+this.settings.elemName+'_'+i);
                elem.parent = this;
                elem.css ({top: y});
                elem.addClass ("h-no-select");
                if (this._internals.elements[i].isLine)
                {
                    elem.addClass ("menuDivider");
                    y+= elem.height();
                }
                else
                {
                    elem.addClass ("menuElement");
                    elem.html("&nbsp;"+this._internals.elements[i].text);
                    elem.myAction=this._internals.elements[i].action;
                    // Name of the menu
                    if (i == 0 && elem.myAction==null)
                        elem.addClass("menuElementHeader");
                    y+= elem.height();
                    elem.bind ("click", {msg: elem}, function (event)
                    {
                        event.data.msg.parent.Show (false);
                        if (event.data.msg.myAction!=null)
                            event.data.msg.myAction (event.data.msg.parent.settings.parent);
                    });				
                    elem.bind ("mouseleave", {msg: elem}, function (event)
                    {
                        event.data.msg.removeClass("menuElementSelected");
                    });	
                    elem.bind ("mouseenter", {msg: elem}, function (event)
                    {
                        if (event.data.msg.myAction!=null) 
                            event.data.msg.addClass("menuElementSelected");
                        if (event.data.msg.parent.settings.timer)
                        {
                            clearTimeout (event.data.msg.parent.settings.timer);
                            event.data.msg.parent.settings.timer = null;
                        }
                    });	
                }
                elem.css({width: _width});
            }
            this._internals.jelement.css({height: y, width: _width});
        }
        this.Show = function (x,y)
        {
            if (hqWidgets.gDynamics.gActiveMenu != null && hqWidgets.gDynamics.gActiveMenu != this)
                hqWidgets.gDynamics.gActiveMenu.Show (false);
        
            if (x!=undefined && y!=undefined)
            {
                this.Create ();
                this.settings.isVisible = true;
                this._internals.jelement.css({top: y, left:x});
                this.Build ();
                hqWidgets.gDynamics.gActiveMenu = this;
                this.timer = setTimeout (function () {
                    if (hqWidgets.gDynamics.gActiveMenu) {hqWidgets.gDynamics.gActiveMenu.Show (false); hqWidgets.gDynamics.gActiveMenu = null;}}, 
                5000);
            }
            else
            {
                this.settings.isVisible = false;
                if (this._internals.jelement)
                {
                    this._internals.jelement.hide();
                    this._internals.jelement.html("");
                }
            }
        }
        this.Delete = function ()
        {
            this.Show (false);
            this.Clear ();
            this._internals.jelement.remove ();
            this._internals.jelement = null;
        }
        this.IsEmpty = function ()
        {
            return (this._internals.elements.length == 0);
        }
    },
    // Convert element type to string
    Slider: function (options){
        // parent
        // x
        // y
        // width    - default horizontal
        // height   - if vertical
        // withText
        // min
        // max
        // position
        // onChange - function (newPos, param)
        // onChangeParam
        var i = 0;
        
        
        while (document.getElementById ("slider_"+i)) i++;
        this.elemName = "slider_"+i;
        this.isVertical = (options.orientation != undefined && options.orientation == 'vertical') || (options.height != undefined);
        if (this.isVertical) this.height = (options.height) ? options.height : 100;
        else this.width = (options.width) ? options.width : 100;
        this.max   = (options.max) ? options.max : 100;
        this.min   = (options.min) ? options.min : 0;
        this.maxLength  = (this.max >= 10000) ? 5 : ((this.max >= 1000) ? 4 : ((this.max >= 100) ? 3: ((this.max >= 10) ? 2 : 1)));
        this.sposition   = 999999;
        this.onChange = (options.onChange) ? options.onChange : null;
        this.onChangeParam = (options.onChangeParam) ? options.onChangeParam : null;
        this.isVisible = true;

        this.parent = (options.parent) ? options.parent : $('body');
        var sText = "<table id='"+this.elemName+"'><tr>";
        if (options.withText)
        {
            sText += "<td><input type='text' id='"+this.elemName+"_text' maxlength='"+this.maxLength+"'></td>";
            if (this.isVertical) sText += "</tr><tr>";
        }
        sText += "<td><div id='"+this.elemName+"_bar'></div></td></tr></table>";
        
        this.parent.append (sText);
        this.jelement = $('#'+this.elemName).addClass("h-no-select");
        this.slider   = $('#'+this.elemName+'_bar').addClass("h-no-select");
        this.slider.parent = this;
        
        if (options.x != undefined)
            this.jelement.css ({position: 'absolute', left: options.x, top: (options.y != undefined) ? options.y: 0});
        
        // Add class
        if (this.isVertical) this.slider.addClass ('sliderBaseV').css({height: '100%'});
        else this.slider.addClass ('sliderBaseH').css({width: '100%'});
        
        this.slider.append("<div id='"+this.elemName+"_scale'></div>");
        this.element = document.getElementById (this.elemName+'_bar');
        this.scale = $('#'+this.elemName+"_scale");
        
        if (this.isVertical) this.scale.css({position: 'absolute', top: 0, left: (this.slider.width() - 9/*this.scale.height()*/)/2}).addClass ("sliderControlV");
        else this.scale.css({position: 'absolute', left: 0, top: (this.slider.height() - 9/*this.scale.height()*/)/2}).addClass ("sliderControlH");
        
        this.scale.append("<div id='"+this.elemName+"_scalePos'></div>").addClass("h-no-select");
        this.scalePos = $('#'+this.elemName+"_scalePos");
        this.scalePos.css({position: 'absolute', left: 0, top: 0}).addClass("h-no-select");
        
        if (this.isVertical) this.scalePos.addClass ("sliderControlPosV");
        else  this.scalePos.addClass ("sliderControlPosH");
        
        this.slider.append("<div id='"+this.elemName+"_handler'></div>");
        this.handler = $('#'+this.elemName+"_handler");
        this.handler.css({position: 'absolute', left: 0, top: 0}).addClass("h-no-select");
        
        if (this.isVertical) this.handler.addClass ("sliderHandlerV");
        else this.handler.addClass ("sliderHandlerH");
        
        if (options.withText)
        {
            this.text = $('#'+this.elemName+'_text').addClass('sliderInfo');
            var elem = document.getElementById (this.elemName+'_text');
            var timeout = 500;
            if (elem)
            {
                elem.parent = this;
                this.Changed = function ()
                {
                    var iPos = parseInt($('#'+this.elemName+'_text').val());
                    if (!isNaN(iPos))
                    {
                        this.SetPosition (iPos);
                    }						
                };
                
                $('#'+this.elemName+'_text').change (function () {this.parent.Changed ();});
                $('#'+this.elemName+'_text').keyup (function () {
                    if (this.parent.timer) clearTimeout (this.parent.timer);
                    this.parent.timer = setTimeout (function(elem) { elem.Changed (); }, 500, this.parent);
                });
            }		
            
            this.text.change (function () {			
                this.parent.SetPosition (parseInt ($(this).val()));
            });	}
            
        if (this.isVertical) this.slider.css({height: this.height - ((this.text) ? this.text.height() : 0)});
        else this.slider.css({width: this.width - ((this.text) ? this.text.width() : 0)});

        this.SetPosition = function (newPos, isForce)
        {
            newPos = parseInt (newPos);
            if (newPos < this.min) newPos = this.min;
            if (newPos > this.max) newPos = this.max;
            if (this.sposition != newPos || isForce)
            {
                this.sposition=newPos;
                if (this.isVertical)
                {
                    var k = this.slider.height()*(this.sposition - this.min)/(this.max - this.min);
                    this.scalePos.css({height:k});
                    this.handler.css({top:k - this.handler.height()/2});
                }
                else
                {
                    var k = this.slider.width()*(this.sposition - this.min)/(this.max - this.min);
                    this.scalePos.css({width:k});
                    this.handler.css({left:k - this.handler.width()/2});
                }
                if (this.text)
                    document.getElementById (this.elemName + "_text").value = ""+newPos;
                    
                if (this.onChange)
                    this.onChange (this.sposition, this.onChangeParam);
            }
        };
        this. SetRange = function (min, max)
        {
            this.min = min;
            this.max = max;
            this.SetPosition (this.sposition, true);
        }
        // Set length or height
        this.SetSize = function (size)
        {
            if (size != undefined)
            {
                if (this.isVertical)
                {
                    this.height = size;
                    this.slider.css({height: this.height - ((this.text) ? this.text.height() : 0)});
                }
                else 
                {
                    this.width = size;
                    this.slider.css({width: this.width - ((this.text) ? this.text.width() : 0)});
                }

                this.SetPosition(this.sposition, true);
            }
        }
        
        document.getElementById (this.elemName+'_bar').parentQuery = this;
        this.OnMouseMove = function (x, y)
        {
            var pos;
            if (this.isVertical)
            {
                var yOffset = y - this.slider.offset().top;// - this.slider.position().top;
                pos = (this.max - this.min)/this.slider.height () * yOffset + this.min;
            }
            else
            {
                var xOffset = x - this.slider.offset().left; //this.slider.position().left;
                pos = (this.max - this.min)/this.slider.width () * xOffset + this.min;
            }
            this.SetPosition (pos);
        }
        this.OnMouseDown = function (x, y, isTouch)
        {
            hqWidgets.gDynamics.gActiveSlider = this;
            hqWidgets.onMouseMove (x, y);	
            return false;
        }
        this.slider.bind ("mousedown", {msg: this}, function (e)
        {
            if (e.data.msg.OnMouseDown(e.pageX, e.pageY, false)) e.preventDefault();	
            return false;
        });
        this.element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            hqWidgets.gDynamics.gIsTouch=true;
            e.target.parentQuery.OnMouseDown (e.touches[0].pageX, e.touches[0].pageY, true);
        }, false);
        
        this.position = function ()
        {
            return this.jelement.position ();
        }
        this.show = function ()
        {
            this.isVisible = true;
            this.jelement.show();
            return this;
        }
        this.hide = function ()
        {
            this.isVisible = false;
            this.jelement.hide();
            return this;
        }	
        this.SetPosition ((options.position != undefined) ? options.position : this.min);
    },
    // Basis class
    DialogContent: function (options) {
        var settings = {
            action:   null,
            result:   null,
        };
        var _internals = {
            callback: function (obj){
                          obj.action (obj.result);
                      },
        };
        this.settings = $.extend (settings, options);
        
        this.Show = function ()
        {
        }
        
        this.Delete = function ()
        {
        }
    },
    ImageDialog: function (options){
        // iwidth
        // iheight
        // withName
        // action    - function (newPos, parent by Show)
        // current   - actual image
        // getImages - function
        var i = 0;
        this.action    = (options.action) ? options.action : null;
        this.result    = null;
        this.current   = (options.current) ? options.current : null;
        this.actionPrm = (options.actionPrm) ? options.actionPrm : null;
        this.getImages = (options.getImages) ? options.getImages : null;
        
        
        while (document.getElementById ("idialog_"+i)) i++;
        this.elemName = "idialog_"+i;
        this.iwidth  = (options.iwidth)  ? options.iwidth : 32;
        this.iheight = (options.iheight) ? options.iheight : 32;
        

        
        this.ShowImages = function (aImages, obj)
        {	
            obj.columns = Math.floor ((obj.parent.width () -20) / (obj.iwidth + 5));
            obj.rows    = Math.floor (aImages.length / obj.columns);
            
            var sText = "<div id='"+obj.elemName+"'><table id='"+obj.elemName+"_tbl'>";
            var row = 0;
            var col;
            for (row = 0; row < obj.rows; row++)
            {
                sText += "<tr>";
                for (col = 0; col < obj.columns; col++)
                {
                    var i=row*obj.columns +col;
                    sText += "<td id='"+obj.elemName+"_"+i+"' style='text-align: center; width:"+obj.iwidth+";height:"+obj.iheight+"'>";
                    sText += "<img id='"+obj.elemName+"_img"+i+"' title='"+aImages[row*obj.columns +col]+"'/>";
                    sText += "</td>";	
                }
                sText += "</tr>";
            }
            
            sText += "</table></div>";
            
            obj.parent.append (sText);
            obj.jelement = $('#'+obj.elemName).addClass("h-no-select").addClass ("imageDialog");
            obj.jelement.css ({height: obj.parent.height (), width: obj.parent.width (), overflow: 'auto'});
            obj.table = $('#'+obj.elemName+'_tbl').addClass("h-no-select");
            obj.table.css({padding: 0, 'mapping': 0});
            
            obj.curElement = null;
            
            for (i = 0; i < aImages.length; i++)
            {
                var img   = $('#'+obj.elemName+"_"+i);
                var image = $('#'+obj.elemName+'_img'+i);
                img.addClass ("imageNormal").css({width: obj.iwidth+4, height: obj.iheight+4});
                
                //document.getElementById (obj.elemName+"_"+i).parent = this;
                img.parent = this;
                img.result = aImages[i];
                image.parent = img;
                image.iwidth = obj.iwidth;
                image.iheight = obj.iheight;
                image.i = i;
                image.isLast = (i == aImages.length-1);
                img.image = image;
                if (obj.current && aImages[i] == obj.current) 
                {	
                    obj.curElement = img;
                    img.removeClass ("imageNormal").addClass ("imageSelected");
                }
                
                if (image.isLast && obj.curElement) image.current = obj.curElement; 
                
                image.bind ("load", {msg: image}, function (event){
                    var obj_ = event.data.msg;
                    if (obj_.width() > obj_.iwidth || obj_.height() > obj_.iheight)
                    {
                        if (obj_.width() > obj_.height())
                            obj_.css ({height: (obj_.height() / obj_.width())  *obj._iwidth,  width:  obj_.iwidth});
                        else
                            obj_.css ({width:  (obj_.width()  / obj_.height()) *obj_.iheight, height: obj_.iheight});
                    } 
                    if (obj_.isLast && obj_.current)
                        obj.parent.parent.jelement.animate ({scrollTop: obj_.current.image.position().top + obj_.current.image.height()}, 'fast');			
                });
                image.error (function (){
                    $(this).hide();
                });
                img.bind ("mouseenter", {msg: img}, function (event)
                {
                    var obj = event.data.msg;
                    obj.removeClass("imageNormal").removeClass("imageSelected").addClass("imageHover");
                });
                img.bind ("mouseleave", {msg: img}, function (event)
                {			
                    var obj = event.data.msg;
                    obj.removeClass("imageHover");
                    if (obj == obj.parent.curElement)
                        obj.addClass  ("imageSelected");
                    else
                        obj.addClass  ("imageNormal");
                });				
                img.bind ("click", {msg: img}, function (event)
                {			
                    var obj_ = event.data.msg;
                    obj.result = obj_.result;
                    if (obj.curElement) obj.curElement.removeClass("imageSelected").addClass("imageNormal");
                    obj.curElement = obj_;
                    obj_.removeClass("imageHover").addClass ("imageSelected");
                    obj.parent.parent.AddTitle (":&nbsp" + obj_.result);
                });				
                img.bind ("dblclick", {msg: img}, function (event)
                {			
                    var obj_ = event.data.msg;
                    obj.result = obj_.result;
                    if (obj.action)
                        obj.action (obj.result, obj.parent);
                });				
                //if (img.complete) img.iload();
                image.attr('src', hqWidgets.gOptions.gPictDir + aImages[i]);
            }
            // Show active image
            if (obj.current) obj.parent.parent.AddTitle (":&nbsp" + obj.current);
            
        }
        this.Show = function (parent)
        {
            this.parent = (parent) ? parent : $('body');
            if (this.getImages)
                this.getImages (this.ShowImages, this);
        }
        
        this.Delete = function ()
        {
            this.jelement.html("").removeClass ("imageDialog").hide ();
            this.jelement = null;
        }
    },
    SettingsDialogContent: function  (options) {

        this.action   = (options.action) ? options.action : null;
        this.result   = null;
        this.infoText = "";	
        this.options  = (options.options) ? options.options : null;
        this.getImage = (options.getImage) ? options.getImage : null; // Get image list callback function
        
        this.callback = function (obj) {obj.action (obj.result);}
        // find free div
        if (!this.options.divName) {
            var i=0;
            do
            {
                var elem = document.getElementById ("settings" + i);
                if (elem == null || $('#settings' + i).is(':visible') == false) 
                    break;
                i++;
            }while(1);
        
            this.elemName = "settings" + i;		
        }
        else
            this.elemName = options.divName;
        
        this.FixOptions = function (options, parentWidth)
        {
            var opt = options;
            if (this.infoText != "" && this.infoText != null && this.infoText != undefined)
                opt.infoText = this.infoText;
            
            opt.temperature = 20;
            opt.valve = 50;
            opt.setTemp = 21;
            opt.humidity = 55;
            opt.position = 50;
            
            if (parentWidth != undefined)
                opt.x = (parentWidth - opt.width) / 2;
            else
                opt.x = 80;
            opt.y = 80;
            return opt;
        }
        
        this.DefaultOptions = function (options, parentWidth) {
            var opt = options;
            
            // Set demo values
            if (opt.buttonType == hqWidgets.gButtonType.gTypeInTemp || opt.buttonType == hqWidgets.gButtonType.gTypeOutTemp)
            {
                opt.iconName = 'Temperature.png';
                opt.width  = hqWidgets.gOptions.gBtWidth;
                opt.height = hqWidgets.gOptions.gBtHeight;
                opt.radius = (hqWidgets.gOptions.gBtWidth > hqWidgets.gOptions.gBtHeight) ? hqWidgets.gOptions.gBtHeight/2 : hqWidgets.gOptions.gBtWidth / 2;
                opt.state  = hqWidgets.gOptions.gStateOff;
                opt.stateEnabled = false;
            }
            else
            if (opt.buttonType == hqWidgets.gOptions.gTypeBlind)
            {
                opt.width        = hqWidgets.gOptions.gBtWidth;
                opt.height       = hqWidgets.gOptions.gBtHeight;
                opt.iconName     = '';
                opt.radius       = 0;
                opt.windowState  = hqWidgets.gState.gStateOn;
                opt.windowConfig = "" + hqWidgets.gSwingType.gSwingLeft;
                opt.width        = hqWidgets.gOptions.gBtWidth;
                opt.height       = hqWidgets.gOptions.gBtHeight;
                opt.radius       = (hqWidgets.gOptions.gBtWidth > hqWidgets.gOptions.gBtHeight) ? hqWidgets.gOptions.gBtHeight/2 : hqWidgets.gOptions.gBtWidth / 2;
                opt.state        = hqWidgets.gState.gStateOn;
                opt.windowState  = hqWidgets.gOptions.gWindowOpened+","+hqWidgets.gOptions.gWindowOpened+","+hqWidgets.gOptions.gWindowOpened+","+hqWidgets.gOptions.gWindowOpened;
                opt.stateEnabled = true;
            }		
            else
            if (opt.buttonType == hqWidgets.gOptions.gTypeLock)
            {
                opt.iconName = 'unlocked.png';
                opt.width = hqWidgets.gOptions.gBtWidth;
                opt.height= hqWidgets.gOptions.gBtHeight;
                opt.state = hqWidgets.gOptions.gStateOff;
                opt.stateEnabled = true;
            }
            else
            if (opt.buttonType == hqWidgets.gOptions.gTypeDoor)
            {
                opt.iconName     = '';
                opt.width        = 50;
                opt.height       = 100;
                opt.radius       = 0;
                opt.state        = hqWidgets.gState.gStateOn;
                opt.doorType     = hqWidgets.gSwingType.gSwingLeft;
                opt.state        = hqWidgets.gState.gStateOn;
                opt.stateEnabled = true;
            }
            else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeImage)
            {
                opt.iconName='plant.png';
                opt.width=undefined;
                opt.height=undefined;
                opt.radius=0;
                opt.state = hqWidgets.gOptions.gStateOff;
                opt.stateEnabled = false;
            }
            else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeText)
            {
                opt.iconName  = '';
                opt.iconOn    = undefined;
                opt.text      = hqWidgets.Translate("Text");
                opt.textFont  = '20px "Tahoma", sans-serif';
                opt.textColor = 'white';
                opt.radius    = 0;
                opt.state     = hqWidgets.gOptions.gStateOff;
                opt.width     = 100;
                opt.height    = 25;
            }
            else
            {
                opt.iconName = 'Lamp.png';		
                opt.width=hqWidgets.gOptions.gBtWidth;
                opt.height=hqWidgets.gOptions.gBtHeight;
                opt.radius=(hqWidgets.gOptions.gBtWidth > hqWidgets.gOptions.gBtHeight) ? hqWidgets.gOptions.gBtHeight/2 : hqWidgets.gOptions.gBtWidth / 2;
                opt.state = hqWidgets.gOptions.gStateOff;
                opt.stateEnabled = true;
            }
                        
            return opt;
        }

        // Get default options for state and stateEnabled
        if (this.options != null)
        {
            var def = hqWidgets.Clone (this.options);
            this.DefaultOptions (def);
            this.options.state        = def.state;
            this.options.windowState  = def.windowState;
            this.options.stateEnabled = def.stateEnabled;
        }
        
        this.Changed = function ()	{	
            this.jbutton.SetSettings (this.FixOptions (this.options, this.jelement.width()));
        }
        
        this.Show = function (parent)
        {
            if (!parent) return;
            
            this.parent = parent;
            
            // Create body
            this.element   = document.getElementById (this.elemName);
            if (!this.element)
            {
                parent.append ('<div id="'+this.elemName+'"></div>');
                this.element = document.getElementById (this.elemName);
            }
            this.jelement = $('#'+this.elemName);
            this.jelement.addClass ("settingsDialog").addClass ("h-no-select").show ();
            this.jelement.css ({overflow: 'auto'});
        
            if (this.options == null)
                return;
            // Create sample button
            this.jbutton = new hqWidgets.hqButton (this.FixOptions(this.options, parent.parent.width), {parent: this.jelement});
            
            // Create button type
            var sText = "<table><tr>";
            sText += "<td>&nbsp;"+hqWidgets.Translate("Type:")+"</td>";
            
            sText += '<td><select id="'+this.elemName+'_type">';
            var i = 0;
            var s;
            sText += "<option disabled>"+hqWidgets.Translate("Select type")+"</option>";
            while ((s = hqWidgets.Type2Name (i)) != "")
            {
                sText += "<option value='"+ i +"' "+((this.options.buttonType==i) ? "selected" : "")+">"+s+"</option>";
                i++;
            }
            sText += "</select></td>";	
            sText += "<td>&nbsp;"+hqWidgets.Translate("State:")+"</td>";
            sText += "<td><input id='"+this.elemName+"_state' type='checkbox' "+((this.options.state == hqWidgets.gState.gStateOn) ? "checked":"")+" "+((this.options.stateEnabled) ? "":"disabled")+"></td>";
            sText += "</tr></table>";
            
            this.jelement.append (sText);
            
            document.getElementById (this.elemName+'_state').parent = this;
            this.jstate = $('#'+this.elemName+'_state').addClass ("h-no-select");
            this.jstate.click (function () {
                this.parent.options.state = $(this).is(':checked') ? hqWidgets.gState.gStateOn: hqWidgets.gState.gStateOff;
                if (this.parent.options.buttonType == hqWidgets.gButtonType.gTypeBlind) 
                {
                    if (this.parent.options.state == hqWidgets.gState.gStateOn)
                        this.parent.options.windowState = hqWidgets.gWindowState.gWindowOpened+","+hqWidgets.gWindowState.gWindowOpened+","+hqWidgets.gWindowState.gWindowOpened+","+hqWidgets.gWindowState.gWindowOpened;
                    else
                        this.parent.options.windowState = hqWidgets.gWindowState.gWindowClosed+","+hqWidgets.gWindowState.gWindowClosed+","+hqWidgets.gWindowState.gWindowClosed+","+hqWidgets.gWindowState.gWindowClosed;
                }
                this.parent.Changed ();
            });
            
            document.getElementById (this.elemName+'_type').parent = this;
            this.jtype = $('#'+this.elemName+'_type').addClass ("h-no-select");
            this.jtype.change (function () {
                this.parent.options.buttonType = $(this).val();
                this.parent.options = this.parent.DefaultOptions (this.parent.options);
                document.getElementById (this.parent.elemName+'_state').checked = (this.parent.options.state == hqWidgets.gState.gStateOn);
                document.getElementById (this.parent.elemName+'_state').disabled = !this.parent.options.stateEnabled;
                this.parent.Changed ();
                this.parent.ShowTable ();
            });
            this.controlWidth = new hqUtils.Slider ({x:        (this.jelement.width() - 200) / 2, 
                                                     y:        35, 
                                                     parent:   this.jelement, 
                                                     withText: true, 
                                                     position: this.options.width, 
                                                     max: 200, 
                                                     min: 10, 
                                                     width: 200, 
                                                     onChangeParam: this, 
                                                     onChange: function (pos, obj){
                                                        obj.options.width = pos;
                                                        obj.options.x = (obj.jelement.width() - obj.options.width) / 2;
                                                        obj.jbutton.SetSettings (obj.options);
                                                        if (obj.controlRadius) 
                                                            obj.controlRadius.SetRange (0, 
                                                                obj.options.width > obj.options.height ? obj.options.height/2 : obj.options.width/2);
                                                     }
            });
            this.controlHeight = new hqUtils.Slider ({x: this.jelement.width() - 40, 
                                                      y: 55, 
                                                      parent: this.jelement, 
                                                      withText: true, 
                                                      position: this.options.height, 
                                                      max: 200, 
                                                      min: 10, 
                                                      height: 200, 
                                                      onChangeParam: this, 
                                                      onChange: function (pos, obj){
                                                            obj.options.height = pos;
                                                            var btnOptions = obj.jbutton.GetSettings ();
                                                            if (obj.jbutton) 
                                                                obj.jbutton.SetSettings (obj.options);
                                                                
                                                            if (obj.table)  
                                                                obj.table.css ({top:btnOptions.y + btnOptions.height + 15});
                                                                
                                                            if (obj.controlRadius) 
                                                                obj.controlRadius.SetRange (0, obj.options.width > obj.options.height ? obj.options.height/2 : obj.options.width/2);
                                                       }
            });
            
            this.Resize = function ()
            {
                if (this.table)
                {
                    var w = this.controlHeight.isVisible ? this.controlHeight.position().left - 5 : this.parent.width() - 5;
                    var btnOptions = this.jbutton.GetSettings ();
                    
                    this.table.css ({width:  w,
                                     top:    btnOptions.y + btnOptions.height + 15,
                                     height: this.parent.height () - 15 - btnOptions.y - btnOptions.height - 15});
                                     
                    if (this._jicon) 
                        this._jicon.css   ({width: this.table.width() - 100 - 5 - 35});
                        
                    if (this.jiconOn) 
                        this.jiconOn.css ({width: this.table.width() - 100 - 5 - 35});
                        
                    if (this.controlRadius) 
                        this.controlRadius.SetSize (this.table.width() - 100 - 5 - 17);
                }
            }
            this.ShowTable = function ()
            {
                var sText = "";
                if (!this.table)
                    sText = "<div id='"+this.elemName+"_table'>"; 
                else
                {
                    this.table.html("");
                }
                sText += "<table><tr><td width=100></td><td></td></tr>";

                if (this.options.buttonType != hqWidgets.gButtonType.gTypeLock  && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeText  && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeImage && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeBlind)
                    sText += "<tr><td>"+ hqWidgets.Translate("Radius:")+"</td><td id='"+this.elemName+"_radius'></td></tr>";
                    
                if (this.options.buttonType == hqWidgets.gButtonType.gTypeDoor)
                {
                    sText += "<tr><td>"+ hqWidgets.Translate("Slide:")+"</td><td><select style='width: 100%'  id='"+this.elemName+"_door'>";
                    sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft+"' "+((this.options.doorType  == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.Translate("Left")+"</option>";
                    sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' "+((this.options.doorType == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.Translate("Right")+"</option>";
                    sText += "</select></td></tr>";
                }
                if (this.options.buttonType == hqWidgets.gButtonType.gTypeBlind)
                {
                    var wnd = this.jbutton._GetWindowType ();
                    var a = wnd.split(',');
                    
                    sText += "<tr><td>"+ hqWidgets.Translate("Slide&nbsp;count:")+"</td><td><select style='width: 100%' id='"+this.elemName+"_wndCount'>";
                    sText += "<option value='1' "+((a.length==1) ? "selected" : "") +">1</option>";
                    sText += "<option value='2' "+((a.length==2) ? "selected" : "") +">2</option>";
                    sText += "<option value='3' "+((a.length==3) ? "selected" : "") +">3</option>";
                    sText += "<option value='4' "+((a.length==4) ? "selected" : "") +">4</option>";
                    sText += "</select></td></tr>";
                    
                    var i;
                    for (i =0 ; i < a.length; i++)
                    {
                        sText += "<tr><td>"+ hqWidgets.Translate("Slide&nbsp;type:")+"</td><td><select id='"+this.elemName+"_wnd"+i+"'>";
                        sText += "<option value='"+hqWidgets.gSwingType.gSwingDeaf +"' " +((a[i] == hqWidgets.gSwingType.gSwingDeaf)  ? "selected" : "") +">"+hqWidgets.Translate("Not opened")+"</option>";
                        sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft +"' " +((a[i] == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.Translate("Left")+"</option>";
                        sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' " +((a[i] == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.Translate("Right")+"</option>";
                        sText += "</select></td></tr>";
                    }
                }
                
                if (this.options.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeText)
                {
                    sText += "<tr><td>"+ hqWidgets.Translate("Icon:")+"</td><td>";
                    sText += "<input id='"+this.elemName+"_icon' type='text' value='"+((this.options.iconName==undefined) ? "" : this.options.iconName)+"'>";
                    sText += "<input id='"+this.elemName+"_iconBtn' type='button' value='...'>";
                    sText += "</td></tr>";
                }
                
                if (this.options.buttonType != hqWidgets.gButtonType.gTypeDoor   && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeBlind  && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeImage  && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeText   &&
                    this.options.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeOutTemp)
                {
                    sText += "<tr><td>"+ hqWidgets.Translate("Icon&nbsp;active:")+"</td><td>";
                    sText += "<input id='"+this.elemName+"_iconOn' type='text' value='"+((this.options.iconOn == undefined) ? "":this.options.iconOn)+"'>";
                    sText += "<input id='"+this.elemName+"_iconOnBtn' type='button' value='...'>";
                    sText += "</td></tr>";
                }
                
                if (this.options.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeText  && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeImage && 
                    this.options.buttonType != hqWidgets.gButtonType.gTypeLock)
                    sText += "<tr><td>"+ hqWidgets.Translate("Sample&nbsp;info:")+"</td><td><input style='width: 100%' id='"+this.elemName+"_info' type='text' value='"+this.infoText+"'></td></tr>";

                if (this.options.buttonType == hqWidgets.gButtonType.gTypeText)
                {
                    sText += "<tr><td>"+ hqWidgets.Translate("Text:")+"</td><td><input style='width: 100%' id='"+this.elemName+"_text' type='text' value='"+this.options.text+"'></td></tr>";
                    sText += "<tr><td>"+ hqWidgets.Translate("Font:")+"</td><td><input style='width: 100%' id='"+this.elemName+"_font' type='text' value='"+this.options.textFont+"'></td></tr>";
                    sText += "<tr><td>"+ hqWidgets.Translate("Color:")+"</td><td><input style='width: 100%' id='"+this.elemName+"_color' type='text' value='"+this.options.textColor+"'></td></tr>";
                }
                    
                sText += "</table>";
                if (!this.table)
                {
                    sText += "</div>";
                    this.jelement.append (sText);
                    this.table = $('#'+this.elemName+'_table');
                }
                else
                    this.table.html(sText);

                // Add on change handlers
                var elem = document.getElementById (this.elemName+'_width');
                var timeout = 500;
                if (elem)
                {
                    elem.parent = this;
                    this.WidthChanged = function ()
                    {
                        this.options.width = parseInt($('#'+this.elemName+'_width').val());
                        if (this.options.width > 200)
                            this.options.width = 200;
                        if (this.options.width < 10)
                            this.options.width = 10;
                        if (!isNaN(this.options.width))
                        {
                            $('#'+this.elemName+'_width').val(this.options.width);
                            this.options.x = (this.parent.parent.width - this.options.width) / 2;
                            this.jbutton.SetSettings (this.options);
                        }						
                    };
                    
                    $('#'+this.elemName+'_width').change (function () {this.parent.WidthChanged ();});
                    $('#'+this.elemName+'_width').keyup (function () {
                        if (this.parent.timer) clearTimeout (this.parent.timer);
                        this.parent.timer = setTimeout (function(elem) { elem.WidthChanged (); }, timeout, this.parent);
                    });
                }
                elem = document.getElementById (this.elemName+'_height');
                if (elem)
                {
                    elem.parent = this;
                    this.HeightChanged = function ()
                    {
                        this.options.height = parseInt($('#'+this.elemName+'_height').val());
                        if (this.options.height > 200)
                            this.options.height = 200;
                        if (this.options.height < 10)
                            this.options.height = 10;
                        if (!isNaN(this.options.height))
                        {
                            $('#'+this.elemName+'_height').val(this.options.height);
                            this.jbutton.SetSettings (this.options);
                            var btnOptions = this.jbutton.GetSettings ();
                            this.table.css ({top:btnOptions.y + btnOptions.height + 15});
                        }
                    };
                    $('#'+this.elemName+'_height').change (function () { this.parent.HeightChanged ();});
                    $('#'+this.elemName+'_height').keyup (function () {
                        if (this.parent.timer) clearTimeout (this.parent.timer);
                        this.parent.timer = setTimeout (function(elem) {elem.HeightChanged ();}, timeout, this.parent);
                    });
                }		
                elem = document.getElementById (this.elemName+'_radius');
                if (elem)
                {
                    this.controlRadius = new hqUtils.Slider ({parent: $('#'+this.elemName+'_radius'), withText: true, position: this.options.radius, max: ((this.options.height>this.options.width) ? this.options.width/ 2:this.options.height/ 2), min: 0, width: 20, onChangeParam: this, 
                        onChange: function (pos, obj){
                            obj.options.radius = pos;
                            
                        if (!isNaN(obj.options.radius))
                                obj.jbutton.SetSettings (obj.options);}
                    });
                }	
                // Process doorType changes
                elem = document.getElementById (this.elemName+'_door');
                if (elem)
                {
                    elem.parent = this;
                    $('#'+this.elemName+'_door').change (function () {
                            this.parent.options.doorType = $(this).val();
                            this.parent.jbutton.SetSettings (this.parent.options);
                        });
                }		
                // Process window count changes
                elem = document.getElementById (this.elemName+'_wndCount');
                if (elem)
                {
                    elem.parent = this;
                    $('#'+this.elemName+'_wndCount').change (function () {
                            var iCnt = $(this).val();
                            var a = this.parent.jbutton._GetWindowType ().split(',');
                            var i;
                            var newS = "";
                            var state = "";
                            for (i = 0; i < iCnt; i++)
                            {
                                newS  += ((newS  == "") ? "" : ",") + ((i < a.length) ? a[i] : hqWidgets.gSwingType.gSwingRight);
                                state += ((state == "") ? "" : ",") + hqWidgets.gState.gStateOn;
                            }
                            
                            this.parent.options.windowConfig = newS;
                            this.parent.options.windowState  = state;
                            this.parent.jbutton.SetSettings (this.parent.options);
                            this.parent.ShowTable ();
                        });
                }	
                // Process window types changes
                var i;
                for (i =0 ; i < 4; i++)
                {
                    elem = document.getElementById (this.elemName+'_wnd'+i);
                    if (elem)
                    {
                        elem.parent = this;
                        elem.index = i;
                        $('#'+this.elemName+'_wnd'+i).change (function () {
                                var a = this.parent.jbutton._GetWindowType ().split(',');
                                var i;
                                var newS = "";
                                for (i = 0; i < a.length; i++)
                                    newS  += ((newS  == "") ? "" : ",") + ((this.index != i) ? a[i] : $(this).val());
                                
                                this.parent.options.windowConfig = newS;
                                this.parent.jbutton.SetSettings (this.parent.options);
                            });
                    }	
                }				
                // Process center image
                elem = document.getElementById (this.elemName+'_icon');
                if (elem)
                {
                    this._jicon = $('#'+this.elemName+'_icon');
                    elem.parent = this;
                    this.IconChanged = function ()
                    {
                        this.options.iconName = $('#'+this.elemName+'_icon').val();
                        if (this.options.iconName == "")
                            this.options.iconName = undefined;
                        this.jbutton.SetSettings (this.options);
                    };
                    this._jicon.change (function () { this.parent.IconChanged ();});
                    this._jicon.keyup (function () {
                        if (this.parent.timer) clearTimeout (this.parent.timer);
                        this.parent.timer = setTimeout (function(elem) {elem.IconChanged ();}, timeout, this.parent);
                    });
                    
                    this.jiconBtn = $('#'+this.elemName+'_iconBtn');
                    this.jiconBtn.bind("click", {msg: this}, function (event) {
                        var obj = event.data.msg;
                        var m = new hqUtils.ImageDialog ({current:   obj.options.iconName, 
                                                          getImages: obj.getImages, 
                                                          action:    function (result, parent) {
                                                                        parent.parent.ButtonCallback (result, parent.parent);
                                                                     }}); 
                        if (!document.getElementById ("imageSelect")) {
                            $("body").append("<div class='dialog' id='imageSelect' title='" + hqWidgets.Translate ("Select image") + "'></div>");
                        }
                        
                        // Define dialog buttons
                        this._selectText = hqWidgets.Translate ("Select");
                        this._cancelText = hqWidgets.Translate ("Cancel");
                        
                        var dialog_buttons = {}; 
                        dialog_buttons[this._selectText] = function() { 
                            $( this ).dialog( "close" ); 
                            if (_onsuccess)
                                _onsuccess (_userArg, value);
                            
                        }
                        dialog_buttons[this._cancelText] = function(){ 
                            $( this ).dialog( "close" ); 
                            
                        }   
                        $('#imageSelect')
                        .dialog({
                            resizable: true,
                            height: $(window).height(),
                            modal: true,
                            width: 600,
                            resize: function(event, ui) { 
                                $("#hmSelectContent").setGridWidth ($('#hmSelect').width()  - 35);
                                $("#hmSelectContent").setGridHeight($('#hmSelect').height() - 53 - $('#hmSelectLocations').height () - $('#hmSelectFunctions').height ());
                                $('#hmSelectLocations').width ($('#hmSelect').width() - 38);
                                $('#hmSelectFunctions').width ($('#hmSelect').width() - 38);
                            },
                            buttons: dialog_buttons
                        });
                        m.Show ($('#imageSelect'));
                    });
                }	
                elem = document.getElementById (this.elemName+'_iconOn');
                if (elem)
                {
                    elem.parent = this;
                    this.jiconOn = $('#'+this.elemName+'_iconOn');
                    this.IconOnChanged = function ()
                    {
                        this.options.iconOn = $('#'+this.elemName+'_iconOn').val();
                        if (this.options.iconOn == "")
                            this.options.iconOn = undefined;
                        this.jbutton.SetSettings (this.options);
                    };
                    this.jiconOn.change (function () { this.parent.IconOnChanged ();});
                    this.jiconOn.keyup (function () {
                        if (this.parent.timer) clearTimeout (this.parent.timer);
                        this.parent.timer = setTimeout (function(elem) {elem.IconOnChanged ();}, timeout, this.parent);
                    });
                    this.jiconOnBtn = $('#'+this.elemName+'_iconOnBtn');
                    this.jiconOnBtn.bind("click", {msg: this}, function (event) {
                        var obj = event.data.msg;
                        var m = new hqUtils.ImageDialog({current: obj.options.iconOn, getImages: obj.getImages, action: function (result, parent)
                        {
                            parent.parent.ButtonCallback (result, parent.parent);
                        }}); 
                        var dlg = new hqUtils.Dialog ({
                            title: hqWidgets.Translate("Choose&nbspimage"), 
                            contentClass: m, 
                            isOk: true,
                            isCancel: true, 
                            positionX: 'center',
                            positionY: 'middle',
                            height: 400, 
                            width: 300,
                            action: function (result) { 
                                if (result == hqWidgets.gDlgResult.gDlgCancel) return; 
                                if (result == hqWidgets.gDlgResult.gDlgOk)
                                    result = this.contentClass.result;
                                obj.options.iconOn = result;
                                $('#'+obj.elemName+'_iconOn').val(result);
                                obj.IconOnChanged();
                            },
                            modal: true});	
                    });
                }	
                
                elem = document.getElementById (this.elemName+'_info');
                if (elem)
                {
                    elem.parent = this;
                    this.InfoChanged = function ()
                    {
                        this.options.infoText = $('#'+this.elemName+'_info').val();
                        if (this.options.infoText == "")
                            this.options.infoText = undefined;
                        this.jbutton.SetSettings (this.options);
                    };
                    $('#'+this.elemName+'_info').change (function () { this.parent.InfoChanged ();});
                    $('#'+this.elemName+'_info').keyup (function () {
                        if (this.parent.timer) clearTimeout (this.parent.timer);
                        this.parent.timer = setTimeout (function(elem) {elem.InfoChanged ();}, timeout, this.parent);
                    });
                }	
                elem = document.getElementById (this.elemName+'_text');
                if (elem)
                {
                    elem.parent = this;
                    this.TextChanged = function ()
                    {
                        this.options.text = $('#'+this.elemName+'_text').val();
                        this.jbutton.SetSettings (this.options);
                    };
                    $('#'+this.elemName+'_text').change (function () { this.parent.TextChanged ();});
                    $('#'+this.elemName+'_text').keyup (function () {
                        if (this.parent.timer) clearTimeout (this.parent.timer);
                        this.parent.timer = setTimeout (function(elem) {elem.TextChanged ();}, timeout, this.parent);
                    });
                }	
                elem = document.getElementById (this.elemName+'_font');
                if (elem)
                {
                    elem.parent = this;
                    this.TextFontChanged = function ()
                    {
                        this.options.textFont = $('#'+this.elemName+'_font').val();
                        this.jbutton.SetSettings (this.options);
                    };
                    $('#'+this.elemName+'_font').change (function () { this.parent.TextFontChanged ();});
                    $('#'+this.elemName+'_font').keyup (function () {
                        if (this.parent.timer) clearTimeout (this.parent.timer);
                        this.parent.timer = setTimeout (function(elem) {elem.TextFontChanged ();}, timeout, this.parent);
                    });
                }
                elem = document.getElementById (this.elemName+'_color');
                if (elem)
                {
                    elem.parent = this;
                    this.TextColorChanged = function ()
                    {
                        this.options.textColor = $('#'+this.elemName+'_color').val();
                        this.jbutton.SetSettings (this.options);
                    };
                    $('#'+this.elemName+'_color').change (function () { this.parent.TextColorChanged ();});
                    $('#'+this.elemName+'_color').keyup (function () {
                        if (this.parent.timer) clearTimeout (this.parent.timer);
                        this.parent.timer = setTimeout (function(elem) {elem.TextColorChanged ();}, timeout, this.parent);
                    });
                }
                if (this.options.buttonType == hqWidgets.gButtonType.gTypeImage) 
                {
                    this.controlHeight.hide();
                    this.controlWidth.hide();
                }
                else
                {
                    this.controlHeight.show();
                    this.controlWidth.show();
                }

                this.table.css ({position:    'absolute', 
                                 left:         15, 
                                 width:        hqWidgets.Translate("Type:").width(), 
                                 'text-align': 'left'});
                this.Resize ();
            }
            
            this.ShowTable ();
        }
        
        this.Delete = function ()
        {
            this.jelement.html("").removeClass ("settingsDialog").hide ();
            this.jelement = null;
        }	
    }, 
    SimpleButton: function  (options) {
        // parent,   - jQuery element 
        // name,     - Non-translated content
        // result,   - Button result
        // callback, - callback in form function (result, callParam)
        // callParam - parameter for callback function (e.g. class pointer)
        // cssPrefix - prefix for 4 css classes "prefix", "prefixNormal", "prefixPressed", "prefixHover"
        // x
        // y
        // vpadding
        // padding

        // Find free index
        var iBtn = 0;
        while (document.getElementById("sbutton_" + iBtn))iBtn++;
        this.elemName = "sbutton_" + iBtn;
        
        this.settings = options;
        var name = hqWidgets.Translate (this.settings.name);
        
        if (!this.settings.cssPrefix) this.settings.cssPrefix = "simpleButton";
        this.settings.cssNormal  = this.settings.cssPrefix+"Normal";
        this.settings.cssPressed = this.settings.cssPrefix+"Pressed";
        this.settings.cssHover   = this.settings.cssPrefix+"Hover";

        // Create div
        var sText = ('<div id="'+this.elemName+'"><div id="'+this.elemName+'1">'+name+'</div></div>');
        if (this.settings.parent) this.settings.parent.prepend (sText);
        else $('body').prepend (sText);
        this.jelement = $('#'+this.elemName);
        this.jtext = $('#'+this.elemName+'1');
        this.jelement.addClass(this.settings.cssPrefix).addClass ("h-no-select");
        this.jelement.addClass(this.settings.cssNormal);

        var w = hqWidgets.Translate (name).width ('12px "Tahoma", sans-serif');
        
        if (this.settings.padding == undefined) this.settings.padding = 5;
        if (this.settings.vpadding == undefined) this.settings.vpadding = this.settings.padding;
        
        if (this.settings.x == undefined && this.settings.align == undefined)
            this.settings.align = 'center';
        if (this.settings.y == undefined && this.settings.valign == undefined)
            this.settings.valign = 'middle';
        
        if (this.settings.x == undefined)
        {
            if (this.settings.align  == 'left')  this.settings.x = this.settings.padding;
            if (this.settings.align  == 'right') this.settings.x = this.settings.parent.width()  - this.jelement.width  () - this.settings.padding;
            if (this.settings.align  == 'center')this.settings.x = (this.settings.parent.width() - this.jelement.width  ()) / 2;
        }
        if (this.settings.y == undefined)
        {
            if (this.settings.valign == 'top')   this.settings.y = this.settings.vpadding;
            if (this.settings.valign == 'bottom')this.settings.y = this.settings.parent.height()  - this.jelement.height () - this.settings.vpadding;
            if (this.settings.valign == 'middle')this.settings.y = (this.settings.parent.height() - this.jelement.height ()) / 2;
        }	
        
        if (this.settings.x != undefined) 
            this.jelement.css({position: 'absolute', left: this.settings.x, top: this.settings.y});
        if (this.settings.width)  this.jelement.css({width: this.settings.width});
        if (this.settings.height) this.jelement.css({width: this.settings.height});
        
        // Position text
        this.jtext.css ({position: 'absolute', 'text-align': 'center', top: (this.jelement.height() - this.jtext.height())/2, left: (this.jelement.width() - w)/2, width: w}).addClass ("h-no-select");

        this.element = document.getElementById(this.elemName);
        this.jelement.bind ("mouseenter", {msg: this}, function (event)
        {
            var obj = event.data.msg;
            obj.jelement.removeClass(obj.settings.cssNormal);
            obj.jelement.removeClass(obj.settings.cssPressed);
            obj.jelement.addClass   (obj.settings.cssHover);
        });
        this.jelement.bind ("mouseleave", {msg: this}, function (event)
        {			
            var obj = event.data.msg;
            obj.jelement.removeClass(obj.settings.cssHover);
            obj.jelement.removeClass(obj.settings.cssPressed);
            obj.jelement.addClass   (obj.settings.cssNormal);
        });	
        this.OnMouseDown = function (obj, x_, y_, isTouch)
        {
            obj.jelement.removeClass(obj.settings.cssNormal);
            obj.jelement.removeClass(obj.settings.cssHover);
            obj.jelement.addClass   (obj.settings.cssPressed);
        }
        this.element.parentQuery = this;
        this.OnClick = function ()
        {
            if (this.settings.callback)
                this.settings.callback (this.settings.result, this.settings.callParam);
        }
        this.OnMouseUp = function (obj, isTouch)
        {
            obj.jelement.removeClass(obj.settings.cssNormal);
            obj.jelement.removeClass(obj.settings.cssHover);
            obj.jelement.addClass   (obj.settings.cssPressed);
        }	
        this.jelement.bind ("mousedown", {msg: this}, function (e)
        {
            e.data.msg.OnMouseDown(e.data.msg, e.pageX, e.pageY, false);		
            return false;
        });
        this.element.addEventListener('touchstart', function(e) {
            if (e.target.parentQuery.OnMouseDown (e.target.parentQuery, e.touches[0].pageX, e.touches[0].pageY, true))
                e.preventDefault();		
        }, false);
        this.element.addEventListener('touchend', function(e) {
            e.target.parentQuery.OnMouseUp (e.target.parentQuery, true);
        }, false);	
        this.jelement.bind ("click", {msg: this}, function (e)
        {
            e.data.msg.OnClick ();
        });
        this.jelement.bind ("mouseup", {msg: this}, function (e)
        {
            e.data.msg.OnMouseUp (e.data.msg, false);
        });	
        this.width = function () { return this.jelement.width(); }
        this.height = function () { return this.jelement.height(); }
        this.SetPosition = function (x, y)
        {
            if (x != undefined) this.jelement.css ({left: x});
            if (y != undefined) this.jelement.css ({top: y});
        }
    },
    Dialog: function (options) {
        // Possible options
        //  title
        //  titleIcon
        //  isClose - isCloseButton
        //  content - just some text
        //  contentClass - text mit logic (jQuery object with properties Show and action(this) as callback)
        //  isYes
        //  isNo
        //  isOk
        //  positionX: center, left, right
        //  positionY: middle, top, bottom
        //  x
        //  y
        //  width
        //  height
        //  modal
        //  timeout

        var padding = 10; // Padding for buttons in footer
        // find free div
        if (!options.divName) {
            var i=0;
            do
            {
                var elem = document.getElementById ("dialog" + i);
                if (elem == null || $('#dialog' + i).is(':visible') == false) 
                    break;
                i++;
            }while(1);
        
            this.elemName = "dialog" + i;		
        }
        else
            this.elemName = options.divName;

        // Dialog result
        this.result = hqWidgets.gDlgResult.gDlgInvalid;

        this.width = (options.width) ? options.width : 200;
        if (this.width < 200) this.width = 200;
        this.height = (options.height) ? options.height : 100;
        if (this.height < 100) this.height = 100;

        this.x = (options.x!=undefined) ? options.x : -1;
        this.y = (options.x!=undefined) ? options.y : -1;
        
        this.action = (options.action) ? options.action : null;

        if (this.x == -1 || (options.positionX != undefined && options.positionX == 'center')) 
            this.x = ($(window).width() - this.width) / 2;
        if (this.y == -1 || (options.positionY != undefined && options.positionY == 'middle')) 
            this.y = ($(window).height() - this.height) / 2;

        if (this.x == -1 || (options.positionX != undefined && options.positionX == 'left')) 
            this.x = 0;
        if (this.y == -1 || (options.positionY != undefined && options.positionY == 'top')) 
            this.y = 0;

        if (this.x == -1 || (options.positionX != undefined && options.positionX == 'right')) 
            this.x = $(window).width() - this.width;
        if (this.y == -1 || (options.positionY != undefined && options.positionY == 'bottom')) 
            this.y = $(window).height() - this.height;

        // Default in the middle	
        if (this.x == -1) 
            this.x = ($(window).width() - this.width) / 2;
        if (this.y == -1) 
            this.y = ($(window).height() - this.height) / 2;
            
        this.SetPosition = function (x, y)
        {
            this.x = x;
            this.y = y;
            this.jelement.css ({top: this.y, left: this.x});
        }
        this.SetSize = function (width, height)
        {
            this.width = (width) ? width : 200;
            if (this.width < 200) this.width = 200;
            this.height = (height) ? height : 100;
            if (this.height < 100) this.height = 100;
            this.jelement.css ({width: this.width, height:this.height});
            if (this.jcaption) this.jcaption.css ({width: this.width - 10});
            if (this.jfooter)  this.jfooter.css({top: this.height - this.jfooter.height()});

            if (this.jbtn1 && this.jbtn2)
                this.jbtn1.css({left: this.width - this.jbtnYes.width() * 2 - 10});
            else
            {
                if (this.jbtn1) this.jbtn1.css({left: this.width - this.jbtn1.width() - 5});		
                if (this.jbtn2) this.jbtn2.css({left: this.width - this.jbtn2.width() - 5});	
            }
        }
        this.Close = function ()
        {
            this.jelement.html("").hide();
            this.jelement = null;
            if (this.jback) {
                this.jback.html("").hide();
                this.jback = null;
            }
            if (this.contentClass) this.contentClass.Delete();
            this.jtext = null;
            this.jcaption = null;
            this.jfooter = null;
        }
        this._setTitle = function (newTitle)
        {
            if (this.jcaption)
            {
                var s = newTitle;
                if (s.width('18px "Tahoma", sans-serif') > this.jcaption.width () - 10)
                {
                    s = s + "...";
                    while (s.width ('18px "Tahoma", sans-serif') > this.jcaption.width ()-10)
                        s = s.substring (0, s.length - 4) + "...";
                }

                this.jcaption.html (s);
            }	
        }
        this.SetTitle = function (newTitle) {
            this.title = newTitle;
            this._setTitle (this.title);
        };
        this.AddTitle = function (addTitle) {
            this._setTitle (this.title + addTitle);
        };	
        
        // Create body
        this.element   = document.getElementById (this.elemName);
        if (!this.element)
        {
            var $newdiv1 = $('<div id="'+this.elemName+'"></div>');
            $('body').append ($newdiv1);
            this.element = document.getElementById (this.elemName);
        }
        this.jelement = $('#'+this.elemName);
        this.jelement.addClass ("dialogBorder").addClass ("h-no-select").show ();
        this.jelement.css ({width: this.width, height:this.height, top: this.y, left: this.x});

        // create caption
        if (!document.getElementById(this.elemName+"_caption"))
            this.jelement.prepend ('<div id="'+this.elemName+'_caption"></div>');
        this.jcaption = $('#'+this.elemName+'_caption');
        this.jcaption.parent = this;
        this.jcaption.addClass("h-dialog-header").addClass("h-dialog-header-normal").addClass ("h-no-select").show ();
        this.jcaption.css ({width: this.width - 10});

        // Create footer with buttons
        if (!document.getElementById(this.elemName+"_footer"))
            this.jelement.prepend ('<div id="'+this.elemName+'_footer"></div>');
        this.jfooter = $('#'+this.elemName+'_footer');
        this.jfooter.addClass("dialogFooter").addClass ("h-no-select").show ();
        this.jfooter.css({top: this.height - this.jfooter.height()});
        this.jfooter.parent = this;

        // Create content
        if (!document.getElementById(this.elemName+"_text"))
            this.jelement.prepend ('<div id="'+this.elemName+'_text"></div>');
        this.jtext = $('#'+this.elemName+'_text');
        this.jtext.addClass("dialogContent").addClass ("h-no-select").show ();
        this.jtext.css ({postion: 'absolute', top: this.jcaption.height() -5, height: this.jelement.height() - this.jfooter.height() - this.jcaption.height() - 5});
        this.jtext.parent = this;
        if (options.content) this.jtext.html(options.content);

        // hide all behind of window
        if (options.modal) 
        {
            if (!document.getElementById(this.elemName+"_back"))
            {
                var $newdiv1 = $('<div id="'+this.elemName+'_back"></div>');
                $('body').append ($newdiv1);
            }
            this.jback = $('#'+this.elemName+'_back');
            this.jback.addClass("h-no-select");
            this.jback.addClass("dialogBack");
            this.jback.css ({height: 2000}).show ();
        }

        if (options.title){
            this.jcaption.html(options.title);
            this.title = options.title;
        }

        if (options.content) this.jtext.html(options.content);
        
        this.ButtonCallback = function (result, obj)
        {
            obj.result = result;
            obj.Close ();
            if (obj.action)
                obj.action (obj.result);
        }
        this.jfooter.css ({'text-align': 'right', 'vertical-align': 'middle'});
        //  isYes
        if (options.isYes)	this.jbtn1 = new hqUtils.SimpleButton ({parent: this.jfooter, name: "Yes", result: hqWidgets.gDlgResult.gDlgYes, callback: this.ButtonCallback, cssPrefix: "dialogButton", align: 'right', callParam: this});
        
        if (options.isNo)
        {
            var btn = new hqUtils.SimpleButton ({parent: this.jfooter, name: "No",  result: hqWidgets.gDlgResult.gDlgNo,  callback: this.ButtonCallback, cssPrefix: "dialogButton", align: 'right', callParam: this});
            if (this.jbtn1)
            {
                this.jbtn2 = btn;
                this.jbtn1.SetPosition (this.width - this.jbtn1.width() - this.jbtn2.width() - 10);
            }
            else
                this.jbtn1 = btn;
        }

        if (options.isOk)	this.jbtn1 = new hqUtils.SimpleButton ({parent: this.jfooter, name: "Ok", result: hqWidgets.gDlgResult.gDlgOk, callback: this.ButtonCallback, cssPrefix: "dialogButton", align: 'right', callParam: this});
        if (options.isCancel)
        {
            var btn = new hqUtils.SimpleButton ({parent: this.jfooter, name: "Cancel",  result: hqWidgets.gDlgResult.gDlgCancel,  callback: this.ButtonCallback, cssPrefix: "dialogButton", align: 'right', callParam: this});
            if (this.jbtn1)
            {
                this.jbtn2 = btn;
                this.jbtn1.SetPosition (this.width - this.jbtn1.width() - this.jbtn2.width() - 10);
            }
            else
                this.jbtn1 = btn;
        }

        if (!options.isYes && !options.isNo && !options.isOk && !options.isCancel) 
            this.jbtn1 = new hqUtils.SimpleButton ({parent: this.jfooter, name: "Close",  result: hqWidgets.gDlgResult.gDlgClose,  callback: this.ButtonCallback, cssPrefix: "dialogButton", align: 'right', callParam: this});

        if (options.contentClass) 
        {
            this.contentClass = options.contentClass;
            options.contentClass.Show(this.jtext);
        }
        
        // install mouse handlers
        this.caption=document.getElementById(this.elemName+'_caption');
        this.caption.parentQuery = this.jcaption;
        this.jcaption.OnMouseDown = function (x_, y_, isTouch)
        {
            hqWidgets.gDynamics.gActiveElement = this;
            this.removeClass("h-dialog-header-normal").addClass("h-dialog-header-active");
            this._cursorX = x_;
            this._cursorY = y_;
        }
        this.jcaption.OnMouseMove = function (x_, y_)
        {
            this.parent.SetPosition (this.parent.x + x_ - this._cursorX, this.parent.y + y_ - this._cursorY);
            this._cursorX = x_;
            this._cursorY = y_;
        }
        this.jcaption.OnMouseUp = function (isTouch)
        {
            this.removeClass("h-dialog-header-active").addClass("h-dialog-header-normal");
            hqWidgets.gDynamics.gActiveElement = null;
        }	
        this.jcaption.bind ("mousedown", {msg: this.jcaption}, function (e)
        {
            e.preventDefault();
            e.data.msg.OnMouseDown(e.pageX, e.pageY, false); 
            return false;
        });
        this.caption.addEventListener('touchstart', function(e) {
            hqWidgets.gDynamics.gIsTouch=true;
            e.preventDefault();	
            e.target.parentQuery.OnMouseDown (e.touches[0].pageX, e.touches[0].pageY, true);
                    
        }, false);
        this.caption.addEventListener('touchend', function(e) {
            e.target.parentQuery.OnMouseUp (true);
        }, false);	
        this.jcaption.bind ("mouseup", {msg: this.jcaption}, function (e)
        {
            e.data.msg.OnMouseUp (false);
        });
    },
};

// Selector of styles (uses jquery themes)
var hqStyleSelector = {
    // local variables
    _currentElement: 0,
    _scrollWidth: -1,
    // Default settings
    settings: {
        // List of styles
        styles:        null,
        width:         100,
        style:         "",     // Init style as text
        onchange:      null,   // onchange fuction: handler (newStyle, onchangeParam);
        onchangeParam: null,   // user parameter for onchange function
        parent:        null,
        height:        30,
        dropOpened:    false,
        id:            -1,
    },
    _findTitle: function (styles, style)
    {
        for(var st in styles) {
            if (styles[st] == style)
                return ((st == "") ? style : st);
        }
        return style;
    },
    
    // Functions
    init: function (options) {
        // Detect scrollbar width
        if (this._scrollWidth == -1)
        {
            // Create the measurement node
            var scrollDiv = document.createElement("div");
            scrollDiv.style.width = 100;
            scrollDiv.style.height = 100;
            scrollDiv.style.overflow = "scroll";
            scrollDiv.style.position = "absolute";
            scrollDiv.style.top = "-9999px";
            document.body.appendChild(scrollDiv);

            // Get the scrollbar width
            this._scrollWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            
            // Delete the DIV 
            document.body.removeChild(scrollDiv);
        }

        var nameImg  = "styleSelectorImg" +this._currentElement;
        var nameText = "styleSelectorText"+this._currentElement;
        var nameBtn  = "styleSelectorB"   +this._currentElement;
        var nameElem = "styleSelector"    +this._currentElement;
        var text = "<table id='"+nameElem+"'><tr><td>";
        text += "<table><tr><td><div id='"+nameImg+"'></div></td><td width=10></td><td style='text-align: left; vertical-align: middle;'><div  style='text-align: left; vertical-align: middle;' id='"+nameText+"'></div>";
        text += "</td></tr></table></td><td>";//<div id='"+nameBtn+"'>";
        text += "<button id='"+nameBtn+"' />";
        text += "</td></tr></table>";
        
        var parent = (options.parent == null) ? $("body") : options.parent;
        parent.append (text);
        var htmlElem = document.getElementById (nameElem);
        htmlElem.settings = {};
        htmlElem.settings = $.extend (htmlElem.settings, this.settings);
        htmlElem.settings = $.extend (htmlElem.settings, options);
        htmlElem.settings.parent = parent;
        htmlElem.settings.id = this._currentElement;
        htmlElem.settings.styles = $.extend ({"None": ""}, options.styles ? options.styles : {});
        
        $('#'+nameImg).css  ({width: htmlElem.settings.height*2,  height: htmlElem.settings.height - 4}).addClass ('ui-corner-all');
        $('#'+nameText).css ({width: htmlElem.settings.width});
        $('#'+nameBtn).button ({icons: {primary: "ui-icon-circle-triangle-s"}, text: false});
        $('#'+nameBtn).click (htmlElem, function (e){
            hqStyleSelector._toggleDrop(e.data);
        });
        $('#'+nameBtn).height(htmlElem.settings.height).width(htmlElem.settings.height);
        var elem = $('#styleSelector'+this._currentElement);
        elem.addClass ('ui-corner-all ui-widget-content');
        if (htmlElem.settings.style != "") {
            $('#'+nameImg).addClass (htmlElem.settings.style);
            $('#'+nameText).html (this._findTitle(htmlElem.settings.styles, htmlElem.settings.style));
        }
        else {
            $('#'+nameText).html ("None");
        }
        
        // Build dropdown box
        text = "<form id='styleSelectorBox"+this._currentElement+"'>";
        var i = 0;
        for (var st in htmlElem.settings.styles) {
            text += "<input type='radio' id='styleSelectorBox"+this._currentElement+""+i+"' name='radio' /><label for='styleSelectorBox"+this._currentElement+""+i+"'>";
            text += "<table><tr><td width="+(htmlElem.settings.height*2+4)+"><div class='ui-corner-all "+htmlElem.settings.styles[st]+"' style='width:"+(htmlElem.settings.height*2)+"; height:"+(htmlElem.settings.height-4)+"'></div></td><td width=10></td><td style='text-align: left; vertical-align: middle;'><div style='text-align: left; vertical-align: middle;'>";
            text += ((st != "")?st:htmlElem.settings.styles[st])+"</div></td></tr></table>";
            text += "</label><br>";
            i++;
        }
        text += "</form>";
        
        htmlElem.settings.parent.append (text);
        
        var box = $('#styleSelectorBox'+this._currentElement);
        box.buttonset();
        $('#styleSelectorBox'+this._currentElement+" :radio").click(htmlElem, function(e) {
            var rawElement = this;
            hqStyleSelector._select (e.data, rawElement.iStyle);
            hqStyleSelector._toggleDrop(e.data);
        });
        i = 0;
        // Set context
        for (var st in htmlElem.settings.styles) {
            document.getElementById ("styleSelectorBox"+this._currentElement+""+i).iStyle = htmlElem.settings.styles[st];
            // Select current button
            if (htmlElem.settings.style == htmlElem.settings.styles[st]) {
                $("#styleSelectorBox"+this._currentElement+""+i).attr("checked","checked");
                box.buttonset('refresh');
            }
            i++;
        }
        htmlElem.settings.count = i;
        box.css ({width: $('#styleSelector'+this._currentElement).width(), overflow: "auto"}).addClass('ui-corner-all ui-widget-content');
        box.css ({position: 'absolute', top: elem.position().top + elem.height(), left: elem.position().left});
        box.hide ();
        this._currentElement++;
        return htmlElem;
    },
    _toggleDrop: function (obj)
    {
        if (obj.settings.dropOpened) {
            $("#styleSelectorBox"+obj.settings.id).css ({display: "none"});
            $("#styleSelectorB"+obj.settings.id).button("option", {icons: { primary: "ui-icon-circle-triangle-s" }});
            obj.settings.dropOpened = false;
        }
        else {
            var elem = $('#styleSelector'+obj.settings.id);		
            var elemBox = $("#styleSelectorBox"+obj.settings.id);		
            //if ($(window).height() < elemBox.height() + elemBox.position().top) {
            // Get position of last element
            var iHeight = obj.settings.count * (obj.settings.height + 18);
            if (iHeight > $(window).height() - elem.position().top - elem.height() - 5)
                elemBox.height($(window).height() - elem.position().top - elem.height() - 5);
            else
                elemBox.height(iHeight + 5);
                
            var iWidth = $("#styleSelector"+obj.settings.id).width();
            elemBox.buttonset().find('table').width(iWidth - 37 - this._scrollWidth);
            $("#styleSelectorBox"+obj.settings.id).css ({display: "", top: elem.position().top + elem.height(), left: elem.position().left});			
            $("#styleSelectorB"+obj.settings.id).button("option", {icons: { primary: "ui-icon-circle-triangle-n" }});
            obj.settings.dropOpened = true;
        }
         
    },
    _select: function (obj, iStyle)
    {
        var nameImg  = "styleSelectorImg" +obj.settings.id;
        var nameText = "styleSelectorText"+obj.settings.id;
        $('#'+nameImg).removeClass (obj.settings.style);
        obj.settings.style = iStyle;
        $('#'+nameImg).addClass (obj.settings.style);
        $('#'+nameText).html (this._findTitle(obj.settings.styles, obj.settings.style));
        if (obj.settings.onchange)
            obj.settings.onchange (obj.settings.style, obj.settings.onchangeParam);     
    },
    destroy: function (htmlElem) {
        $("#styleSelectorBox"+htmlElem.settings.id).remove ();			
        $('#styleSelector'+htmlElem.settings.id).remove ();			
    }
};
