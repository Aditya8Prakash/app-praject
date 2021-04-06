import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, Alert, Dimensions, Linking, Vibration} from 'react-native';
import {Header, Card} from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import db from "../config";
import firebase from 'firebase';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from "expo-permissions";
import {Camera} from 'expo-camera';
import {RFPercentage} from "react-native-responsive-fontsize";
import {TouchableRipple, FAB, List, Divider, Switch} from 'react-native-paper';

var cameraRefrence = null;

var display = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
}

var versionInfo ={
    initialVersionCode:0.1,
    versionCode:'',
}

var APIfeature = [
    { type: "CROP_HINTS", maxResults: 4 },
    { type: "SAFE_SEARCH_DETECTION", maxResults: 4 },
    { type: "LABEL_DETECTION", maxResults: 4 },
    { type: "FACE_DETECTION", maxResults: 4 },
    { type: "LOGO_DETECTION", maxResults: 4 },
    { type: "LANDMARK_DETECTION", maxResults: 4 },
];

export default class SearchScreen extends React.Component {
    state = {
        image: null,
        hasCameraPremission: null,
        cameraInUse:false,
        camMode:Camera.Constants.Type.back,
        response:'',
        s2:true,
        s4:false,
        s5:true,
        s6:false,
        s7:false,
        optionInUse:false,
        settingInUse:false,
        theme:true
    }
    createUniqueId = () => {return Math.random().toString(36).substring(7);}
    logOut = ()=> firebase.auth().signOut().then(this.props.navigation.navigate('LoginScreen'));
    openSettings = () =>this.setState({settingInUse:true})
    pickImage = async () => {
        var result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4,4],
            quality: 1,
        });
        this.setState({image:result.uri});
    };
    useCamera=()=>this.setState({cameraInUse:true});
    getCameraPermissions=async()=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasCameraPremission:status==='granted'});
    }
    cancl=()=>{
        if (this.state.image) {
            Vibration.vibrate();
            this.setState({image:null});
        } else {
            Alert.alert(' > Image is not selected !\n > Please select one');
        }
    }
    toogleCam=()=>this.state.camMode===Camera.Constants.Type.back?this.setState({camMode:Camera.Constants.Type.front}):this.setState({camMode:Camera.Constants.Type.back});
    closeCam=()=>this.setState({cameraInUse:false});
    takeASnap=async()=>{
        if (cameraRefrence) {
            var obj = await cameraRefrence.takePictureAsync();
            this.setState({cameraInUse:false,image:obj.uri});
        }
    }
    uploadImage = async (uri, id) => {
        var response = await fetch(uri);
        var blob = await response.blob();
        return firebase.storage().ref().child('user_Searches/'+'image_'+id+id).put(blob).then(response=>this.fetchImage(id));
    };
    fetchImage=id=>firebase.storage().ref().child('user_Searches/'+'image_'+id+id).getDownloadURL().then(url=>this.setState({image:url})).catch(error=>Alert.alert('An Error Occured : ( \n >> '+error+' <<'));
    findImage=async()=>{
        if (this.state.image) {
            this.uploadImage(this.state.image,this.createUniqueId());
            try {
                var body = JSON.stringify({requests: [{features: APIfeature,image: {source: {imageUri: this.state.image}}}]});
                var response = await fetch("https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAfw-ROB7qlZpiU2RwkNJoEKR2vfFz6QDs",
                {
                    headers: {Accept: "application/json","Content-Type": "application/json"},
                    method: "POST",
                    body: body
                });
                var responseJson = await response.json();
                this.setState({response: responseJson});
                console.log(responseJson);
            } catch (error) {console.log(error)}
        } else {Alert.alert(' > Image is not selected !\n > Please select one');}
    }
    launchOptions=()=>this.setState({optionInUse:true});
    closeOptions=()=>this.setState({optionInUse:false});
    handleOption=(type,value,name,max) =>{
        this.setState({
            s2:type==='s2'?value:this.state.s2,
            s4:type==='s4'?value:this.state.s4,
            s5:type==='s5'?value:this.state.s5,
            s6:type==='s6'?value:this.state.s6,
            s7:type==='s7'?value:this.state.s7,
        });
        if (value===true) {
            APIfeature.push({ type: name, maxResults: max });
        } else if (value===false) {
            for (let i = 0; i < APIfeature.length; i++) {
                var element = APIfeature[i];
                if (element.type ===  name) {
                    APIfeature.splice(i);
                }
            }            
        }
    }
    back=()=>this.setState({settingInUse:false});
    launchInfo=()=>alert('Info:\n > Version : '+versionInfo.initialVersionCode+'\n > Latest_Version : '+versionInfo.versionCode+'\n > Date : '+Date()+'\n > App_Status : OK \n > API_Level : '+APIfeature.length);
    getDataFromServer = async () =>{
        await firebase.database().ref('/').once('value',data=>versionInfo.versionCode=data.val().versionCode,err=>console.log(err));
        if (versionInfo.versionCode !== versionInfo.initialVersionCode) {alert('You are using older version of this app \nYou are recomended to update the app from Google PlayStore');}
    }
    componentDidMount(){
        this.getCameraPermissions();
        this.getDataFromServer();
    }
    changeVal=val=>this.setState({theme:val});
    render(){
        if (!this.state.settingInUse) {
            if (!this.state.cameraInUse) {
                if (!this.state.optionInUse) {
                    return (
                        <SafeAreaProvider>
                            <Header backgroundColor='#3b9ca3'>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.openSettings}>
                                    <Icon name='user' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                                <Text style={styles.headingStyle}>Find-By-Image</Text>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.logOut}>
                                    <Icon name='logout' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                            </Header>
                            <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                                <View style={styles.imageContainer}>
                                    <Image style={styles.image} source={{ uri: this.state.image }} />
                                    <Text style={this.state.theme?[styles.txt1,{color:'#00ffff'}]:styles.txt1}>
                                        Pick Image from :
                                    </Text>
                                        <View style={styles.row2}>
                                            <TouchableRipple rippleColor='#00000022' style={styles.button} onPress={this.pickImage}>
                                                <Text style={this.state.theme?[styles.text,{color:'#ffffff'}]:styles.text}>Gallery</Text>
                                            </TouchableRipple>
                                            <TouchableRipple rippleColor='#00000022' style={styles.button} onPress={this.useCamera}>
                                                <Text style={this.state.theme?[styles.text,{color:'#ffffff'}]:styles.text}>Camera</Text>
                                            </TouchableRipple>
                                        </View>
                                        <View style={styles.row3}>
                                            <TouchableRipple rippleColor='#00000022' style={styles.searcbtns} onPress={this.findImage}>
                                                <Text style={this.state.theme?[styles.text,{color:'#ffffff'}]:styles.text}>Search</Text>
                                            </TouchableRipple>
                                            <TouchableRipple rippleColor='#00000022' style={styles.searcbtns} onPress={this.cancl}>
                                                <Text style={this.state.theme?[styles.text,{color:'#ffffff'}]:styles.text}>Cancel</Text>
                                            </TouchableRipple>
                                        </View>
                                </View>
                                <FAB style={styles.fab} large icon={()=>{return <Icon name='setting' style={styles.fabIcon}/>}} onPress={this.launchOptions} animated={false}/>
                            </View>
                        </SafeAreaProvider>
                    );
                } else {
                    return(
                        <SafeAreaProvider>
                            <Header backgroundColor='#3b9ca3'>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.closeOptions}>
                                    <Icon name='arrowleft' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                                <Text style={styles.headingStyle}>Find-By-Image</Text>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.logOut}>
                                    <Icon name='logout' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                            </Header>
                            <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                                <View style={styles.listCont}>
                                    <List.Subheader style={styles.listhed}>
                                        <Icon name='edit' style={styles.icon4S} />
                                        Coustomize Your Search :
                                    </List.Subheader>
                                        <Divider/>
                                    <List.Item style={styles.list} left={()=>{return <Text style={styles.listtxt}>Face Detection</Text>}} right={()=>{return <Switch value={this.state.s2} color='#3b9ca3' onValueChange={value=>this.handleOption('s2',value,"FACE_DETECTION",5)}/>}}/>
                                        <Divider/>
                                    <List.Item style={styles.list} left={()=>{return <Text style={styles.listtxt}>Text Detection</Text>}} right={()=>{return <Switch value={this.state.s4} color='#3b9ca3' onValueChange={value=>this.handleOption('s4',value,"TEXT_DETECTION",5)}/>}}/>
                                        <Divider/>
                                    <List.Item style={styles.list} left={()=>{return <Text style={styles.listtxt}>Landmark Detection</Text>}} right={()=>{return <Switch value={this.state.s5} color='#3b9ca3' onValueChange={value=>this.handleOption('s5',value,"LANDMARK_DETECTION",5)}/>}}/>
                                        <Divider/>
                                    <List.Item style={styles.list} left={()=>{return <Text style={styles.listtxt}>Handwritng Detection</Text>}} right={()=>{return <Switch value={this.state.s6} color='#3b9ca3' onValueChange={value=>this.handleOption('s6',value,"DOCUMENT_TEXT_DETECTION",5)}/>}}/>
                                        <Divider/>
                                    <List.Item style={styles.list} left={()=>{return <Text style={styles.listtxt}>Image Properties</Text>}} right={()=>{return <Switch value={this.state.s7} color='#3b9ca3' onValueChange={value=>this.handleOption('s7',value,"IMAGE_PROPERTIES",5)}/>}}/>
                                        <Divider/>
                                </View>
                                    <Switch value={this.state.theme} onValueChange={val=>this.changeVal(val)}/>
                            </View>
                        </SafeAreaProvider>
                    )
                }
            }
            if (this.state.cameraInUse) {
                if (this.state.hasCameraPremission) {
                    return (
                        <SafeAreaProvider>
                            <Header backgroundColor='#3b9ca3'>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.closeCam}>
                                    <Icon name='close' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                                <Text style={styles.headingStyle}>Find-By-Image</Text>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.logOut}>
                                    <Icon name='logout' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                            </Header>
                            <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                                <Camera style={styles.camera} type={this.state.camMode} ratio={1} ref={refrence=>cameraRefrence=refrence}>
                                    <View style={styles.dash}>
                                        <View style={styles.row}>
                                            <TouchableOpacity onPress={this.toogleCam}>
                                                <Icon name='retweet' style={styles.cambtnoth}/>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={this.takeASnap}>
                                                <Icon name='camera' style={styles.camerabtn}/>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={this.closeCam}>
                                                <Icon name='close' style={styles.cambtnoth} />
                                            </TouchableOpacity>
                                        </View>   
                                    </View>
                                </Camera>
                            </View>
                        </SafeAreaProvider>
                    )
                }else{
                    return(
                        <SafeAreaProvider>
                            <Header backgroundColor='#3b9ca3'>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.openSettings}>
                                    <Icon name='user' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                                <Text style={styles.headingStyle}>Find-By-Image</Text>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.logOut}>
                                    <Icon name='logout' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                            </Header>
                            <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                                <Text style={styles.nocam}>No Camera Premission</Text>
                                <Text style={styles.nocam2}>Please Provide Camera Permission :-)</Text>
                                <TouchableOpacity style={styles.per} onPress={this.getCameraPermissions}>
                                    <Text style={styles.text}>
                                        Grant Camera Premission
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.per} onPress={this.closeCam}>
                                    <Text style={styles.text}>
                                        Deny Camera Premission
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaProvider> 
                    )
                }
            }
        } else {
            return (
                <SafeAreaProvider>
                    <Header backgroundColor='#3b9ca3'>
                        <TouchableOpacity style={styles.logotbtn} onPress={this.back}>
                            <Icon name='arrowleft' type='antdesign' style={styles.icon}/>
                        </TouchableOpacity>
                            <Text style={styles.headingStyle}>Find-By-Image</Text>
                        <TouchableOpacity style={styles.logotbtn} onPress={this.logOut}>
                            <Icon name='logout' type='antdesign' style={styles.icon}/>
                        </TouchableOpacity>
                    </Header>
                    <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                        <Card containerStyle={{backgroundColor:'#00000000',borderWidth:0}}>
                        <Card.Title style={this.state.theme?[styles.titleS,{color:'#00ffff'}]:styles.titleS}>
                            <Icon style={this.state.theme?[styles.icon2S,{color:'#00ffff'}]:styles.icon2S} name='profile'/>
                            A Note From Developer
                        </Card.Title>
                            <Card.Divider style={this.state.theme?{backgroundColor:'#ffffff'}:{backgroundColor:'#000000'}}/>
                            <Text style={this.state.theme?[styles.cardTxtS,{color:'#00ffff'}]:styles.cardTxtS}>
                                As a Developer I would really like that you would rate my app. If there is any bug, glitch, suggestion or feedback related to this app, then please report it on my support email.
                            </Text>
                            <Text style={this.state.theme?[styles.thankS,{color:'#00ffff'}]:styles.thankS}>
                                Thank you,{'\n'}--Aditya Prakash
                            </Text>
                            <Card.Divider style={this.state.theme?{backgroundColor:'#ffffff'}:{backgroundColor:'#000000'}}/>
                            <View style={styles.dashS}>
                                <TouchableRipple rippleColor={this.state.theme?'#00ffff33':'#00000022'} onPress={()=>Linking.openURL('market://details?id=')} style={this.state.theme?[styles.btnS,{background:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btnS}>
                                    <Text style={this.state.theme?[styles.txtS,{color:'#00ffff'}]:styles.txtS}>Rate App</Text>
                                </TouchableRipple>
                                <TouchableRipple rippleColor={this.state.theme?'#00ffff33':'#00000022'} onPress={()=>Linking.openURL('mailto:suportwithfindbyimage@gmail.com')} style={this.state.theme?[styles.btnS,{background:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btnS}>
                                    <Text style={this.state.theme?[styles.txtS,{color:'#00ffff'}]:styles.txtS}>E-mail Me</Text>
                                </TouchableRipple>
                            </View>
                            <Card.Divider style={this.state.theme?{backgroundColor:'#ffffff'}:{backgroundColor:'#000000'}}/>
                            <View style={styles.dashS}>
                                <TouchableRipple rippleColor={this.state.theme?'#00ffff33':'#00000022'} onPress={()=>Linking.openURL('https://discord.gg/AV73XSXq2m')} style={this.state.theme?[styles.btnS,{background:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btnS}>
                                    <Text style={this.state.theme?[styles.txtS,{color:'#00ffff'}]:styles.txtS}>Discord</Text>
                                </TouchableRipple>
                                <TouchableRipple rippleColor={this.state.theme?'#00ffff33':'#00000022'} onPress={()=>Linking.openURL('https://www.youtube.com/channel/UCIJF8t1WzTWG8RbYpz9rzTA')} style={this.state.theme?[styles.btnS,{background:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btnS}>
                                    <Text style={this.state.theme?[styles.txtS,{color:'#00ffff'}]:styles.txtS}>YouTube</Text>
                                </TouchableRipple>
                            </View>
                            <Card.Divider style={this.state.theme?{backgroundColor:'#ffffff'}:{backgroundColor:'#000000'}}/>
                        </Card>
                    <TouchableOpacity style={this.state.theme?[styles.btn2S,{background:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btn2S} onPress={this.launchInfo}>
                        <Icon style={this.state.theme?[styles.icon3S,{color:'#00ffff'}]:styles.icon3S} name='infocirlceo'/>
                        <Text style={this.state.theme?[styles.txt1S,{color:'#00ffff'}]:styles.txt1S}>More Info</Text>
                    </TouchableOpacity>
                    </View>
                </SafeAreaProvider>
            )
        }
    }
}

const styles = StyleSheet.create({
    headingStyle:{
        fontSize:RFPercentage(4.25),
        color:'#ffffff',
        letterSpacing:-2,
        alignSelf:'center'
    },
    logotbtn:{
        flexDirection:'row',
        backgroundColor:'#ffffff36',
        borderRadius:5,
        alignItems:'center'
    },
    icon:{
        padding: 10 ,
        color:'#ffffff',
        fontSize:RFPercentage(3)
    },
    image:{
        width:display.width-50<350 === true?display.width-50:350,
        height:display.width-50<350 === true?display.width-50:350,
        backgroundColor:'#d6d6d6',
        borderRadius:5
    },
    text:{
        fontSize:RFPercentage(3)
    },
    row2:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        justifyContent:'space-evenly'
    },
    row:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    button:{
        padding:10,
        backgroundColor:'#4cc8e7af',
    },
    container:{
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        flex:1,
        backgroundColor:'#ffffff',
        width:display.width,
    },
    nocam:{
        fontSize:RFPercentage(3.5)
    },
    nocam2:{
        fontSize:20,
        marginBottom:60
    },
    camera:{
        width:500,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        flex:1
    },
    per:{
        padding:10,
        margin:10,
        backgroundColor:'#4cc8e7',
        borderRadius:5,
        letterSpacing:-1
    },
    camerabtn:{
        fontSize:60,
        color:'#ffffff',
        backgroundColor:'#47bac263',
        padding:10,
        borderRadius:500,
        margin:25
    },
    dash:{
        marginTop:display.height-190,
        backgroundColor:'#00000065',
        width:display.width+30
    },
    cambtnoth:{
        fontSize:40,
        color:'#ffffff',
        backgroundColor:'#47bac263',
        padding:10,
        borderRadius:100
    },
    txt1:{
        alignSelf:'center',
        margin:10,
        fontSize:30,
        letterSpacing:-2
    },
    button2:{
        padding:10,
        backgroundColor:'#4cc8e74d',
        borderRadius:5
    },
    row3:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        justifyContent:'space-around',
        margin:30
    },
    searcbtns:{
        paddingHorizontal:15,
        paddingVertical:10,
        backgroundColor:'#6fabd6',
    },
    fab: {
        position: 'absolute',
        right: 50,
        bottom:50,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        backgroundColor:'#4bc1c9'
    },
    fabIcon:{
        color:'#ffffff',
        fontSize:25,
        transform:[{scale:1.3}]
    },
    list:{
        padding:10,
        width:display.width-70,
    },
    listtxt:{
        fontSize:17
    },
    listCont:{
        padding:15,
    },
    listhed:{
        fontSize:20,
        color:'#000000',
        flexDirection:'row'
    },
    titleS:{
        fontSize:RFPercentage(3),
        letterSpacing:-1,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        color:'#000000'
    },
    btnS:{
        padding:5,
        backgroundColor:'#4cc8e7af',
        width:120,
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'space-around',
        alignItems:'center',
        borderRadius:2.5
    },
    txtS:{
        fontSize:20,
        letterSpacing:-1
    },
    dashS:{
        justifyContent:'space-around',
        alignItems:'center',
        alignContent:'center',
        marginBottom:15,
        flexDirection:'row'
    },
    thankS:{
        margin:10,
        letterSpacing:-1,
        fontSize:20
    },
    cardTxtS:{
        fontSize:20,
        letterSpacing:-1
    },
    titleS:{
        fontSize:RFPercentage(3),
        letterSpacing:-1,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
    },
    icon2S:{
        padding:10,
        fontSize:RFPercentage(4)
    },
    txt1S:{
        fontSize:25,
    },
    btn2S:{
        padding:10,
        backgroundColor:'#4cc8e7af',
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'space-around',
        alignItems:'center',
        marginVertical:40
    },
    icon3S:{
        fontSize:25,
        paddingRight:10,
    },
    icon4S:{
        paddingRight:10,
        fontSize:20
    },
});