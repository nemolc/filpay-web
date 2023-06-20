import { CoinType, newBLSAddress, newDelegatedAddress, newSecp256k1Address } from "@glif/filecoin-address";
import { ElMessage } from 'element-plus'
import { getBytes, keccak256, Wallet } from "ethers";
import __wbg_init, {
    blsPublicKey,
    blsSign,
    delegatedPublicKey,
    delegatedSign,
    secp256k1PublicKey,
    secp256k1Sign,
} from "./filecoin_signer_wasm.js";
import { BaseNone } from "basenone";

let filecoinSignerWasmUrl = undefined

export function isEqualAddress(addr0, addr1) {
    return addr1.indexOf(addr0)
}

export class Sigs {
    static async getAddressByKeywords(network, keywords) {
        await __wbg_init(filecoinSignerWasmUrl);
        var privateKey = Sigs._getPrivateKeyByKeywords(keywords);
        var sigs = Sigs.fromPrivateKey2(network, privateKey);
        var publicAddresses = [];

        for (var i = 0; i < sigs.length; i++) {
            publicAddresses.push(sigs[i].GetAddress());
        }

        return publicAddresses;
    }

    static _getPrivateKeyByKeywords(keywords) {
        keywords = keywords.join(" ");
        return Wallet.fromPhrase(keywords).privateKey;

    }

    static async SignByKeywords(network, keywords, privateType, msg) {
        await __wbg_init(filecoinSignerWasmUrl)
        var privateKey = Sigs._getPrivateKeyByKeywords(keywords);
        var sigs = Sigs.fromSecp256k1(network, privateKey);

        switch (privateType) {
            case "secp256k1":
                return sigs[0].Sign(msg)
            case "delegated":
                return sigs[1].Sign(msg)
            default:
                ElMessage.error("illegal private type " + privateType)
                throw new Error("illegal private type " + privateType)
        }
    }
    static async SignByPrivateKey(network, privateKey, privateType, msg) {
        await __wbg_init(filecoinSignerWasmUrl)
        try {
            var sigs = Sigs.fromSecp256k1(network, privateKey);

            switch (privateType) {
                case "secp256k1":
                    return sigs[0].Sign(msg)
                case "delegated":
                    return sigs[1].Sign(msg)
                default:
                    ElMessage.error("illegal private type " + privateType)
                    throw new Error("illegal private type " + privateType)
            }
        } catch (e) {
            var sig = Sigs.fromKeyInfo(network, privateKey)
            return sig.Sign(msg)
        }
    }

    static fromSecp256k1(network, privateKey) {
        privateKey = privateKey.toLowerCase();
        switch (privateKey.length) {
            case 64:
                privateKey = BaseNone.fromHex(privateKey).getRaw();
                break;
            case 66:
                privateKey = getBytes(privateKey)
                break;
            default:
                ElMessage.error("Invalid private key")
                throw new Error("Invalid private key")
        }

        return [new Secp256k1(network, privateKey), new Delegated(network, privateKey)];
    }

    static async getAddressesByPrivateKey(network, privateKey) {
        await __wbg_init(filecoinSignerWasmUrl);
        try {
            console.log("begin to fromSecp256k1")
            var sigs = Sigs.fromSecp256k1(network, privateKey);
            console.log("finish fromSecp256k1")
            var publicAddresses = [];

            for (var i = 0; i < sigs.length; i++) {
                publicAddresses.push(sigs[i].GetAddress());
            }

            return publicAddresses;
        } catch (e) {
            console.log("begin to fromKeyInfo")
            var sig = Sigs.fromKeyInfo(network, privateKey)
            console.log("finish fromKeyInfo")
            var publicAddresses = [];

            publicAddresses.push(sig.GetAddress());
            return publicAddresses;
        }
    }


    static fromKeyInfo(network, keyInfo) {
        var key_info = JSON.parse(BaseNone.fromHex(keyInfo).toUTF8());

        if (!key_info.hasOwnProperty("Type") && !key_info.hasOwnProperty("PrivateKey")) {
            ElMessage.error("illegal private key")
            throw new Error("illegal private key")
        }

        var privateKey = BaseNone.fromBase64(key_info.PrivateKey).getRaw();
        switch (key_info.Type) {
            case "secp256k1":
                return new Secp256k1(network, privateKey);
            case "bls":
                return new Bls(network, privateKey);
            case "delegated":
                return new Delegated(network, privateKey)

            default:
                ElMessage.error("illegal private key")
                throw new Error("illegal private key")
        }
    }
}


class Secp256k1 {
    constructor(network, priKey) {
        if (network == "mainnet") {
            this.network = CoinType.MAIN;
        } else {
            this.network = CoinType.TEST;
        }

        this.priKey = priKey;
    }

    GetAddress() {
        return newSecp256k1Address(secp256k1PublicKey(new Uint8Array(this.priKey)), this.network).toString();
    }

    Sign(msg) {
        return new Uint8Array(secp256k1Sign(new Uint8Array(this.priKey), msg));
    }
}


class Bls {
    constructor(network, priKey) {
        if (network == "mainnet") {
            this.network = CoinType.MAIN;
        } else {
            this.network = CoinType.TEST;
        }

        this.priKey = priKey;
    }

    GetAddress() {
        return newBLSAddress(blsPublicKey(new Uint8Array(this.priKey)), this.network).toString();
    }

    Sign(msg) {
        return new Uint8Array(blsSign(new Uint8Array(this.priKey), msg))
    }
}


class Delegated {
    constructor(network, priKey) {
        if (network == "mainnet") {
            this.network = CoinType.MAIN;
        } else {
            this.network = CoinType.TEST;
        }

        this.priKey = priKey
    }

    GetAddress() {
        let publicKey = delegatedPublicKey(new Uint8Array(this.priKey));
        return newDelegatedAddress(10, getBytes(keccak256(publicKey.slice(1))).slice(12), this.network).toString();
    }

    Sign(msg) {
        return new Uint8Array(delegatedSign(new Uint8Array(this.priKey), msg));
    }
}

