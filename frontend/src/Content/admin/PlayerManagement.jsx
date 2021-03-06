import { ArrowBackIos, ArrowForwardIos, Search } from "@mui/icons-material"
import { Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, Input, InputLabel, Link, MenuItem, Select, TextField, Typography } from "@mui/material"
import { Box } from "@mui/system";
import { useSnackbar } from "material-ui-snackbar-provider";
import { useEffect, useState } from "react"
import { addPlayer, deletPlayer, editPlayer, getAllClubs, getClubPlayers } from "../../api";

const PlayerManagement = () => {
    const [players, setPlayers] = useState([])

    const [allClub, setAllClub] = useState([]);
    const [playerClub, setUserClub] = useState('');

    useEffect( () => {
        getAllClubs().then( data => {
            setAllClub(data)
        }).catch( err => {
            console.log(err);
        })
    }, [])

    const getClubPlayer = () => {
        getClubPlayers(playerClub).then(data => {
            setPlayers(data)
        }).catch(err => {
            console.log(err.response);
        })
    }

    useEffect( getClubPlayer, [playerClub])
    
    const [dialogOpen, setDialogOpen] = useState(false)
    const closeDialog = () => {setDialogOpen(false)}

    return (<>
        <Typography variant="h5" sx={{mb: 4}}>
            Admin Panel Player Management
        </Typography>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={6}>
                <Button variant='contained' color="success" fullWidth onClick={() => {setDialogOpen(true)}}>
                    Add Player +
                </Button>
                <Dialog open={dialogOpen} onClose={closeDialog} fullWidth='true'>
                    <DialogTitle>Insert a Player</DialogTitle>
                    <AddPlayerDialog handleClose={closeDialog} />
                </Dialog>
            </Grid>
            <Grid item xs={6}>
            <FormControl size="small" fullWidth>
                <InputLabel id='club-label'>Club</InputLabel>

                <Select labelId="club-label"
                    value={playerClub}
                    label='Favourite Club'
                    onChange={ e => { e.target.value && setUserClub(e.target.value)}}
                >
                    <MenuItem value=''>Select</MenuItem>
                    {allClub.map( v => (
                        <MenuItem value={v.short_name} key={v.short_name}>{v.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            </Grid>
        </Grid>

        <Grid container justifyContent="flex-start" alignItems="center" sx={{mt: 4}} spacing={2}>
            {players.map(value => <PlayerCard data={value} />)}
        </Grid>
    </>)
}

const PlayerCard = ({data}) => {
    const [editOpen, setEditOpen] = useState(false);
    const {id, name, position, availibility_status, availibility_percentage, price_current, club, logo_url, player_club} = data
    const [state, setState] = useState({availibility_status, availibility_percentage, price_current})
    
    const closeDialog = () => {setEditOpen(false)}

    const snackbar = useSnackbar()    
    
    return <Grid item xs={6}>
        <Card sx={{width: '100%'}} >
            <CardContent>
                <Grid container>
                    <Grid xs={9} item>
                        <Typography gutterBottom variant="h5" component="div">
                            {name} 
                        <Chip label={`${position}`} sx={{mx: 2}}/>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {player_club} <br />
                            {state.availibility_status} (<Box sx={{ fontWeight: '700'}} component='span'>{state.availibility_percentage}%</Box>)  <br />
                            ${Math.round(state.price_current*10)/10}
                        </Typography>
                    </Grid>
                    <Grid xs={3} item>
                        <img src={logo_url} style={{width: '100%', height: 'auto'}} alt={club} />
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Button size="small" variant='text' color="success" onClick={ () => {setEditOpen(true)}}>
                    Edit
                </Button>
                <Button size="small" variant='text' color="error" onClick={ () => {
                    deletPlayer(id).then(d => {
                        closeDialog()
                        snackbar.showMessage('Delete successful!')
                    }).catch( err => {
                        snackbar.showMessage('Error deleting...')
                    })
                }}>
                    Remove
                </Button>
            </CardActions>
        </Card>
        <Dialog open={editOpen} onClose={closeDialog} fullWidth='true'>
            <DialogTitle>Edit Player Status</DialogTitle>
            <EditPlayerDialog handleClose={closeDialog} data={data} setStatus={setState} />
        </Dialog>
    </Grid>
} 

const EditPlayerDialog = ({handleClose, data, setStatus}) => {
    const {id, name, position, availibility_status : as_data, availibility_percentage: ap_data, price_current : pc_data, club, logo_url, player_club} = data

    const [availibility_percentage, setAvailibityPercentage] = useState(ap_data);
    const [availibility, setAvailibity] = useState(as_data);
    const [price, setPrice] = useState(pc_data);

    return (<>
        <DialogContent>
        {name} - {club} ({position})
        <Box component='form' sx={{mt: 3, width: '100%'}} onSubmit={ e=> {
            e.preventDefault()
        }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>

            <TextField variant='outlined' type={'text'} label='Availibility' margin='normal' size='small'
            value={availibility} onChange={e=>{setAvailibity(e.target.value)}} />

            <TextField variant='outlined' type={'number'} label='Availibility Percentage' margin='normal' size='small'
            value={availibility_percentage} onChange={e=>{setAvailibityPercentage(Number.parseInt(e.target.value))}} />

            </Box>


            <TextField type={'number'} variant='outlined' label='Price' sx={{display: 'block', mt: 2, flexGrow: '1'}} margin="normal" size='small' fullWidth
            value={price} onChange={e=>{setPrice(Number.parseFloat(e.target.value))}} />

        </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={() => {
                editPlayer(id, availibility_percentage, availibility, price).then(d => {
                    handleClose()
                    setStatus({availibility_status: availibility, availibility_percentage, price_current: price})
                }).catch( err => {
                    console.log(err)
                })
            }}>Update</Button>
        </DialogActions>
    </>)
}

const AddPlayerDialog = ({handleClose}) => {
    const [availibility_percentage, setAvailibityPercentage] = useState(100);
    const [availibility, setAvailibity] = useState('Available');
    const [position, setPosition] = useState('GKP');
    const possiblePosition = ['GKP', 'DEF', 'MID', 'FWD']
    const [name, setName] = useState('');
    const [price, setPrice] = useState(5.0);
    const [club, setClub] = useState('');
    const [allClub, setAllClub] = useState([]);

    useEffect( () => {
        getAllClubs().then( data => {
            setAllClub(data)
        }).catch( err => {
            console.log(err);
        })
    }, [])

    return (<>
        
        <DialogContent>
        <Box component='form' sx={{mt: 3, width: '100%'}} onSubmit={ e=> {
            e.preventDefault()
        }}>

            <TextField variant='outlined' type={'text'} label='Name' sx={{display: 'block'}} margin='normal' size='small' fullWidth
            value={name} onChange={e=>{setName(e.target.value)}} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2}}>

            <FormControl size="small" sx={{width: '100px'}}>
                <InputLabel id='pos-label'>Player Position</InputLabel>

                <Select labelId="pos-label"
                    value={position}
                    label='Player Position'
                    onChange={ e => { e.target.value && setPosition(e.target.value)}}
                >
                    {possiblePosition.map( v => (
                        <MenuItem value={v} key={v}>{v}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{width: '400px'}}>
                <InputLabel id='fav-club-label'>Player Club</InputLabel>

                <Select labelId="fav-club-label"
                    value={club}
                    label='Player Club'
                    onChange={ e => { e.target.value && setClub(e.target.value)}}
                >
                    <MenuItem value=''>Select</MenuItem>
                    {allClub.map( v => (
                        <MenuItem value={v.short_name} key={v.short_name}>{v.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                
            <TextField variant='outlined' type={'text'} label='Availibility' margin='normal' size='small'
            value={availibility} onChange={e=>{setAvailibity(e.target.value)}} />

            <TextField variant='outlined' type={'number'} label='Availibility Percentage' margin='normal' size='small'
            value={availibility_percentage} onChange={e=>{setAvailibityPercentage(Number.parseInt(e.target.value))}} />

            
            <TextField type={'number'} variant='outlined' label='Price' sx={{display: 'block', mt: 2}} margin="normal" size='small'
            value={price} onChange={e=>{setPrice(Number.parseFloat(e.target.value))}} />
            
            </Box>

        </Box>
        </DialogContent>

        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={() => {
                addPlayer(name, club, position, availibility, availibility_percentage, price).then(d => {
                    handleClose()
                }).catch(err => {
                    console.log(err)
                })
            }} variant="contained">Create a Player</Button>
        </DialogActions>
    </>)
}

export default PlayerManagement