import { secp256k1 } from '@noble/curves/secp256k1';
import { ElMessage } from 'element-plus'
import {
    newSecp256k1Address,
    newBLSAddress,
    newDelegatedAddress, CoinType, bigintToArray
} from "@glif/filecoin-address";
import { BaseNone } from "basenone";
import { keccak256, getBytes, Wallet } from "ethers";
import blake2b from "@bitgo/blake2b";

export function isEqualAddress(addr0, addr1) {
    return addr1.indexOf(addr0)
}
export class Sigs {
    static getAddressByKeywords(network, keywords) {
        var privateKey = Sigs.getPrivateKeyByKeywords(keywords);
        var sigs = Sigs.fromPrivateKey2(network, privateKey);
        var publicAddresses = [];

        for (var i = 0; i < sigs.length; i++) {
            publicAddresses.push(sigs[i].GetAddress());
        }

        return publicAddresses;
    }

    static getPrivateKeyByKeywords(keywords) {
        // keywords = keywords.join(" ");
        return Wallet.fromPhrase(keywords).privateKey;

    }

    static SignByKeywords(network, keywords, privateType, msg) {
        var privateKey = Sigs.getPrivateKeyByKeywords(keywords);
        var sigs = Sigs.fromPrivateKey2(network, privateKey);

        switch (privateType) {
            case "secp256k1":
                return sigs[0].Sign(msg)
            case "delegated":
                return sigs[1].Sign(msg)
            default:
                ElMessage.error("illegal private type " + privateType)
        }
    }

    static getAddressesByPrivateKey(network, privateKey) {
        try {
            var sigs = Sigs.fromPrivateKey2(network, privateKey);
            var publicAddresses = [];

            for (var i = 0; i < sigs.length; i++) {
                publicAddresses.push(sigs[i].GetAddress());
            }

            return publicAddresses;
        } catch (e) {
            var sig = Sigs.fromKeyInfo(network, privateKey)
            var publicAddresses = [];
            publicAddresses.push(sig.GetAddress());
            return publicAddresses;
        }
    }

    static SignByPrivateKey(network, privateKey, privateType, msg) {
        try {
            var sigs = Sigs.fromPrivateKey2(network, privateKey);

            switch (privateType) {
                case "secp256k1":
                    return sigs[0].Sign(msg)
                case "delegated":
                    return sigs[1].Sign(msg)
                default:
                    ElMessage.error("illegal private type " + privateType)
            }
        } catch (e) {
            var sig = Sigs.fromKeyInfo(network, privateKey)
            return sig.Sign(msg)
        }
    }

    static fromPrivateKey2(network, privateKey) {
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
        }

        return [new Secp256k1(network, privateKey), new Delegated(network, privateKey)];
    }

    static fromKeyInfo(network, keyInfo) {
        var key_info = JSON.parse(BaseNone.fromHex(keyInfo).toUTF8());

        if (!key_info.hasOwnProperty("Type") && !key_info.hasOwnProperty("PrivateKey")) {
            ElMessage.error("illegal private key")
        }

        var privateKey = BaseNone.fromBase64(key_info.PrivateKey).getRaw();
        switch (key_info.Type) {
            case "secp256k1":
                return new Secp256k1(network, privateKey);
            case "bls":
                ElMessage.error("unsupported")
            case "delegated":
                return new Delegated(network, privateKey)

            default:
                ElMessage.error("illegal private key")
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
        console.log(this.priKey)
        return newSecp256k1Address(secp256k1.getPublicKey(new Uint8Array(this.priKey), false), this.network).toString();
    }

    Sign(msg) {
        var output = new Uint8Array(32)
        blake2b(output.length).update(msg).digest(output);
        var signature = secp256k1.sign(output, new Uint8Array(this.priKey))
        var r = bigintToArray(signature.r);
        var s = bigintToArray(signature.s);

        var fil_sig = new Uint8Array(65);
        fil_sig.set(r, 0);
        fil_sig.set(s, 32);
        fil_sig[64] = signature.recovery;
        return fil_sig;
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
    }

    Sign(msg) {
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
        let publicKey = secp256k1.getPublicKey(new Uint8Array(this.priKey), false);
        return newDelegatedAddress(10, getBytes(keccak256(publicKey.slice(1))).slice(12), this.network).toString();
    }

    Sign(msg) {
        var output = getBytes(keccak256(msg));
        var signature = secp256k1.sign(output, new Uint8Array(this.priKey))
        var r = bigintToArray(signature.r);
        var s = bigintToArray(signature.s);

        var fil_sig = new Uint8Array(65);
        fil_sig.set(r, 0);
        fil_sig.set(s, 32);
        fil_sig[64] = signature.recovery;
        return fil_sig;
    }
}

// var privateKey4 = "7b2254797065223a22736563703235366b31222c22507269766174654b6579223a2245713076766c53416f636173456d5345505943576c30586b314e36496438706d43476b635155504d6854343d227d"
// var privateKey3 = "0x90052791e89cc2372109edeb96d350bb8b4dc088cff22677f2baad05bb3c5f03"
// var privateKey2 = "dfdb26508b6656eaa4df8605c7f6c1e8946f658bc40759454de2f1412b35091f"
// var privateKey1 = "7b2254797065223a2264656c656761746564222c22507269766174654b6579223a22466c6f6a65524f47786d4f30654c71514479626f4e36583537642f50764a4a642f583173644f4c4c6f69553d227d"
// var privateKey = privateKey4;
//
//
// var addrs = Sigs.getAddressesByPrivateKey("test", privateKey)
// console.log(addrs);
//

// var msg = new Uint8Array([0, 1, 2, 3, 4, 5]);
// var signature = Sigs.SignByPrivateKey("test", privateKey, "delegated", msg)
//
// console.log(signature)