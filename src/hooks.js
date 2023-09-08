
import { useEffect, useState } from 'react';
import { getSharedData, watchSharedData } from './clientStorage';

export const useSharedData = id => {
    const [data, setData] = useState(getSharedData(id))
    useEffect(() => {
        return watchSharedData(id, result => {
            setData(result?.data)
        })
    }, [])
    return data
}