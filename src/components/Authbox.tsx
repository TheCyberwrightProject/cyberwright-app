import { Anchor, Button, Card, Divider, Input, PasswordInput, Text, Box, rem, Progress, Loader } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell"
import { X, Check } from "lucide-react"
import { useState } from "react";
import { BsGoogle } from "react-icons/bs";
import { AuthResponse } from "@/types";
import { useRouter } from "next/navigation";
import { sendErrNotification } from "@/utils";
import { start, onUrl } from "@fabianlars/tauri-plugin-oauth"

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text
        c={meets ? 'teal' : 'red'}
        style={{ display: 'flex', alignItems: 'center' }}
        mt={7}
        size="sm"
        >
        {meets ? (
            <Check style={{ width: rem(14), height: rem(14) }} />
        ) : (
            <X style={{ width: rem(14), height: rem(14) }} />
        )}{' '}
        <Box ml={10}>{label}</Box>
        </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
    let multiplier = password.length > 6 ? 0 : 1;
  
    requirements.forEach((requirement) => {
      if (!requirement.re.test(password)) {
        multiplier += 1;
      }
    });
    
    multiplier += password.length <= 25 ? 0 : 1;

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 5);
}

export default function Authbox({ isLogin }: { isLogin: boolean }) {
    const [name, setName] = useState("");
    const [nameErr, setNameErr] = useState(false);
    const [email, setEmail] = useState("");
    const [emailErr, setEmailErr] = useState(false);
    const [password, setPassword] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    const router = useRouter();

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(password)} />
    ));
    const strength = getStrength(password);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    const type = isLogin ? "login" : "sign up"

    const handleSubmit = () => {
        setNameErr(false);
        setEmailErr(false);
    
        if (email.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailErr(true);
            return;
        }

        if (!isLogin) {
            if (name.length === 0 || name.length > 20) {
                setNameErr(true);
                return;
            }
    
            if (getStrength(password) !== 100) {
                return;
            }
        }
        setSubmitLoading(true)
        setButtonsDisabled(true)

        if(isLogin) {
            invoke<AuthResponse>("login", { data: {
                email: email,
                password: password
            }}).then(() => {
                return router.push('/')
            })
            .catch((err) => {
                sendErrNotification("Login Error", err)
                setSubmitLoading(false)
                setButtonsDisabled(false)
            })
        } else {
            invoke<AuthResponse>("signup", { data: {
                name: name,
                email: email,
                password: password
            }}).then(() => {
                return router.push('/')
            })
            .catch((err) => {
                sendErrNotification("Sign Up Error", err)
                setSubmitLoading(false)
                setButtonsDisabled(false)
            })
        }
    };

    const handleGoogleSubmit = async () => {
        setGoogleLoading(true)
        setButtonsDisabled(true)
        try {
            const port = await start({ response: "Login successful. You may close this window." });
            const [auth_url, redirect_uri] = await invoke<[string, string]>("generate_auth_url", { port: port });
            await open(auth_url);

            const unlisten = await onUrl(async (url) => {
                try {
                    const params = new URL(url).searchParams;
                    if (params.has("error")) {
                        sendErrNotification("Google authentication failed", params.get("error") as string);
                    } else if (params.has("code")) {
                        const code = params.get("code");
                        await invoke("google_auth", { data: { code, redirect_uri } });
                        await router.push("/");
                    } else {
                        sendErrNotification("Google authentication failed", "No Google code present - Invalid Response");
                    }
                } catch (err) {
                    sendErrNotification("Google authentication failed", err as string);
                } finally {
                    unlisten();
                    setGoogleLoading(false);
                    setButtonsDisabled(false);
                }
            })
        } catch(err) {
            sendErrNotification("Google authentication failed", err as string)
            setGoogleLoading(false)
            setButtonsDisabled(false)
        }
    }
    

    return (
        <Card withBorder radius="md" padding={""} shadow="sm" className="w-2/4 px-32 -mt-10">
            <p className="font-bold text-2xl capitalize">{type}</p>
            <Button
                variant="outline"
                onClick={!buttonsDisabled ? handleGoogleSubmit : () => {}}
                loading={googleLoading}
            >
                <div className="flex items-center space-x-1">
                    <BsGoogle />
                    <p className="my-0 mt-1">Google</p>
                </div>
            </Button>
            <Divider className="mt-5" label={`Or ${type} with e-mail`} labelPosition="center"/>
            <Card.Section className="mt-2 flex flex-col space-y-5 pb-10" inheritPadding>
                {
                    isLogin ? <></> :
                    <Input.Wrapper label="Name" withAsterisk error={nameErr ? "Invalid name" : ""}>
                        <Input 
                            placeholder="John Doe" 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Input.Wrapper>
                }
                <Input.Wrapper label="Email" withAsterisk error={emailErr ? "Invalid email" : ""}>
                    <Input 
                        placeholder="email@cyberwright.org" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Input.Wrapper>
                <PasswordInput 
                    withAsterisk
                    label="Password"
                    placeholder="***********" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {
                    isLogin ? <></> :
                    <>
                        <Progress color={color} value={strength} size={5} mb="xs" />
                        <PasswordRequirement label="Includes at least 7 characters" meets={password.length > 6} />
                        {checks}
                        <PasswordRequirement label="No more than 25 characters" meets={password.length <= 25} />
                    </>
                }

                <Button
                    color="green"
                    variant="filled"
                    className="capitalize"
                    onClick={!buttonsDisabled ? handleSubmit : () => {}}
                    loading={submitLoading}
                >
                    {type}
                </Button>
                {
                    isLogin ? 
                    <p>
                        New user? <Anchor href="/signup" underline="always" className="text-[#1fd698]">Create an account</Anchor>
                    </p> :
                    <p>
                        Already have an account? <Anchor href="/login" underline="always" className="text-[#1fd698]">Login</Anchor>
                    </p>
                }
                
            </Card.Section>
        </Card>
    )
}