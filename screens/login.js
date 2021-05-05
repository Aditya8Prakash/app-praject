import React from 'react';
import { Text,View,StyleSheet,TextInput,KeyboardAvoidingView,ImageBackground,Image,Alert,Dimensions} from 'react-native';
import db from '../config'
import firebase from 'firebase';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {TouchableRipple, ActivityIndicator} from 'react-native-paper';

var display = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
}
export default class LoginScreen extends React.Component {
    constructor () {
        super();
        this.state = {
            password:'',
            email:'',
            login:false,
        }
    }
    handleError=error=>{
        this.setState({login:false});
        return alert('Error : '+error);
    }
    userLogin = (username, password)=>{
        this.setState({login:true});
        firebase.auth().signInWithEmailAndPassword(username, password).then(responce=>this.props.navigation.navigate('SearchScreen')).catch(error=>this.handleError(error));
    }
    userSignUp = (username, password)=>firebase.auth().createUserWithEmailAndPassword(username, password).then(responce=>Alert.alert('Signup Success! \n Just tap on login button')).catch(error=>{return Alert.alert('Error Code :'+error.code+' '+error.message)});
    render() {
        if (!this.state.login) {
            return(
                <SafeAreaProvider>
                    <ImageBackground style = {styles.container} source={require('../assets/back.jpg')}>
                        <View>
                            <View style={styles.logo}>
                                <View style={styles.imgContnr}>
                                    <Image style={styles.img} source={require('../assets/adaptive-icon.png')}/>
                                </View>
                                <Text style={styles.hed}>Find-By-Image</Text>
                            </View>
                            <View style = {styles.secContainer}>
                                <Text style={styles.textStyle}>Login / Sign Up</Text>
                                <KeyboardAvoidingView>
                                    <TextInput style = {styles.textInpt} placeholder='E-mail' keyboardType='email-address' value={this.state.email} onChangeText={(txt)=>{this.setState({email:txt})}} />
                                    <TextInput style = {styles.textInpt} placeholder='Password' keyboardType='visible-password' secureTextEntry={true} value={this.state.password} onChangeText={(txt)=>{this.setState({password:txt})}}/>
                                    <View style = {styles.btnContainer} >
                                        <TouchableRipple rippleColor='#00000022' style = {styles.btn} onPress={()=>this.userLogin(this.state.email,this.state.password)}>
                                            <Text style = {styles.btnTxt}>Login</Text>
                                        </TouchableRipple>
                                        <TouchableRipple rippleColor='#00000022' style = {styles.btn} onPress={()=>this.userSignUp(this.state.email,this.state.password)}>
                                            <Text style = {styles.btnTxt}>SignUp</Text>
                                        </TouchableRipple>
                                    </View>
                                </KeyboardAvoidingView>
                            </View>
                        </View>
                    </ImageBackground>
                </SafeAreaProvider>
             )
        } else {
            return (
                <View style={styles.container1}>
                    <Text style={styles.txt}>Please Wait Logging You in : )</Text>
                    <ActivityIndicator size='large' animated={true} style={styles.loading} color='#ffffff'/>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    textStyle: {
        fontSize:30,
        padding:2.5,
        fontWeight:'100',
        marginBottom:15
    },
    textInpt :{
        width:display.width-100<350 === true?display.width-100:350,
        fontSize:19,
        fontWeight:'400',
        alignSelf:'center',
        color:'#ffffff',
        padding:7,
        marginVertical:5,
        borderRadius:5,
        backgroundColor:'#ffffff35'
    },
    btn:{
        padding:10,
        backgroundColor:'#ffffff3f',
        width:100,
        borderRadius:3,
        margin:10,
        alignItems:'center',
    },
    btnContainer:{
        flexDirection:'row',
        justifyContent:'center'
    },
    btnTxt:{
        fontSize:20,
        fontWeight:'300'
    },
    secContainer:{
        backgroundColor:'#ffffff22',
        padding:15,
        borderRadius:20,
        shadowColor:'#000000',
        shadowOpacity:0.65,
        shadowRadius:30,
    },
    img:{
        width:150,
        height:150,
        alignSelf:'center',
    },
    hed:{
        fontSize:45,
        fontWeight:'300',
        alignSelf:'center',
        letterSpacing:-2,
        color:'#ffffff'
    },
    logo:{
        alignSelf:'center',
        margin:50
    },
    container1:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        backgroundColor:'#4bc1c9',
        height:display.height,
        width:display.width,
    },
    txt:{
        fontSize:25,
        paddingVertical:75,
        color:'#ffffff'
    },
    loading:{
        transform:[{scale:1.2}]
    }
});